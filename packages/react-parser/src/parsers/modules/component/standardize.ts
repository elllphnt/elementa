import {
  ArrowFunction,
  Block,
  FunctionDeclaration,
  Node,
  Project,
  SyntaxKind,
  VariableDeclaration,
} from "ts-morph";

export function standardizeComponent(sourceCode: string): string {
  // 1. Create a ts-morph project in memory and add the source code
  const project = new Project({
    useInMemoryFileSystem: true,
    skipAddingFilesFromTsConfig: true,
  });
  const sourceFile = project.createSourceFile("Component.tsx", sourceCode, {
    overwrite: true,
  });

  // 2. Find the default export (e.g. `export default ItemList;`)
  const exportAssignments = sourceFile.getExportAssignments();
  if (exportAssignments.length === 0) {
    throw new Error("No default export found.");
  }
  const exportAssignment = exportAssignments[0];
  const exportedExpr = exportAssignment.getExpression();
  if (!exportedExpr) {
    throw new Error("Cannot resolve default export expression.");
  }
  const componentName = exportedExpr.getText().trim();
  if (!componentName) {
    throw new Error("Default export is not a valid identifier.");
  }

  // 3. Locate the component declaration by name (variable or function)
  const variableDecl = sourceFile
    .getVariableDeclarations()
    .find((v) => v.getName() === componentName);
  const functionDecl = sourceFile
    .getFunctions()
    .find((f) => f.getName() === componentName);

  if (!variableDecl && !functionDecl) {
    throw new Error(`Component "${componentName}" not found.`);
  }

  const isVariable = !!variableDecl;
  const componentDecl = (isVariable ? variableDecl! : functionDecl!) as
    | VariableDeclaration
    | FunctionDeclaration;

  // 4. Extract the function node (arrow or function declaration)
  let componentFunction: ArrowFunction | FunctionDeclaration;
  if (isVariable) {
    const init = (componentDecl as VariableDeclaration).getInitializer();
    if (
      !init ||
      !(Node.isArrowFunction(init) || Node.isFunctionExpression(init))
    ) {
      throw new Error(
        `Expected "${componentName}" to be an arrow or function expression.`
      );
    }
    componentFunction = init as ArrowFunction;
  } else {
    componentFunction = componentDecl as FunctionDeclaration;
  }

  // 5. Handle destructured props, including rest: capture normal keys and restName
  const normalProps: string[] = [];
  let restPropName: string | undefined;
  let propsTypeText: string | undefined;

  const originalParams = componentFunction.getParameters();
  if (originalParams.length > 0) {
    const firstParam = originalParams[0];
    const nameNode = firstParam.getNameNode();

    // Retrieve the type text before removal
    const typeNode = firstParam.getTypeNode();
    if (typeNode) {
      propsTypeText = typeNode.getText();
    }

    if (Node.isObjectBindingPattern(nameNode)) {
      // For each binding element, check if it's rest or normal
      nameNode.getElements().forEach((elem) => {
        if (Node.isBindingElement(elem)) {
          const identifierNode = elem.getNameNode();
          if (Node.isIdentifier(identifierNode)) {
            // If there's a "..." token, this is a rest element
            if (elem.getDotDotDotToken()) {
              restPropName = identifierNode.getText();
            } else {
              normalProps.push(identifierNode.getText());
            }
          }
        }
      });
      // Now remove all parameters
      originalParams.forEach((param) => param.remove());
      // Insert single `props` parameter, preserving type if it existed
      if (propsTypeText) {
        componentFunction.insertParameter(0, {
          name: "props",
          type: propsTypeText,
        });
      } else {
        componentFunction.insertParameter(0, { name: "props" });
      }
    }
  }

  // 6. Ensure there's a block body, then separate raw logic vs. return
  const bodyNode = componentFunction.getBody();
  if (!bodyNode || !Node.isBlock(bodyNode)) {
    throw new Error(`Component "${componentName}" must have a block body.`);
  }
  const bodyBlock = bodyNode as Block;
  const allStatements = bodyBlock.getStatements();

  // Split statements into rawLogicStatements (before return) and the single returnStatement
  const rawLogicStatements: import("ts-morph").Statement[] = [];
  let returnStatement: import("ts-morph").ReturnStatement | undefined =
    undefined;
  for (const stmt of allStatements) {
    if (Node.isReturnStatement(stmt)) {
      returnStatement = stmt;
      break;
    } else {
      rawLogicStatements.push(stmt);
    }
  }
  if (!returnStatement) {
    throw new Error(`No return statement found in "${componentName}".`);
  }

  // 7. Remove any destructuring-of-props variable statements inside logic:
  //    e.g. `const { a, b } = props;` or `const { title, ...rest } = props;`
  const logicStatements: import("ts-morph").Statement[] = [];
  rawLogicStatements.forEach((stmt) => {
    if (
      Node.isVariableStatement(stmt) &&
      stmt
        .getDeclarationList()
        .getDeclarations()
        .some((decl) => {
          const nameNode = decl.getNameNode();
          const init = decl.getInitializer();
          return (
            Node.isObjectBindingPattern(nameNode) &&
            init &&
            Node.isIdentifier(init) &&
            init.getText() === "props"
          );
        })
    ) {
      // Skip destructuring-from-props
      return;
    }
    logicStatements.push(stmt);
  });

  // 8. Replace references to normalProps/rest in logicStatements and returnStatement
  normalProps.forEach((propName) => {
    logicStatements.forEach((stmt) => {
      const idents = stmt
        .getDescendantsOfKind(SyntaxKind.Identifier)
        .filter((id) => id.getText() === propName);
      idents.forEach((identifier) => {
        identifier.replaceWithText(`props.${propName}`);
      });
    });
    const retExpr = returnStatement!.getExpression();
    if (retExpr) {
      const idents = retExpr
        .getDescendantsOfKind(SyntaxKind.Identifier)
        .filter((id) => id.getText() === propName);
      idents.forEach((identifier) => {
        identifier.replaceWithText(`props.${propName}`);
      });
    }
  });

  if (restPropName) {
    logicStatements.forEach((stmt) => {
      const idents = stmt
        .getDescendantsOfKind(SyntaxKind.Identifier)
        .filter((id) => id.getText() === restPropName);
      idents.forEach((identifier) => {
        identifier.replaceWithText(`props`);
      });
    });
    const retExpr = returnStatement!.getExpression();
    if (retExpr) {
      const idents = retExpr
        .getDescendantsOfKind(SyntaxKind.Identifier)
        .filter((id) => id.getText() === restPropName);
      idents.forEach((identifier) => {
        identifier.replaceWithText(`props`);
      });
    }
  }

  // 9. Gather parameter texts (with types) for the component signature
  const paramTextsWithTypes = componentFunction
    .getParameters()
    .map((p) => p.getText())
    .join(", ");

  // 10. Gather only parameter names (no types) for hook call
  const paramNames = componentFunction
    .getParameters()
    .map((p) => p.getName())
    .join(", ");

  // 11. If there's JSX outside the return (in logic), abort with "-1"
  const jsxKinds = [
    SyntaxKind.JsxElement,
    SyntaxKind.JsxSelfClosingElement,
    SyntaxKind.JsxFragment,
  ];
  for (const stmt of logicStatements) {
    for (const kind of jsxKinds) {
      if (stmt.getDescendantsOfKind(kind).length > 0) {
        return "-1";
      }
    }
  }

  // 12. If no logic statements remain, emit only the component as a FunctionDeclaration
  if (logicStatements.length === 0) {
    const rawReturnText = returnStatement!.getText();
    const funcLines = [
      `function ${componentName}(${paramTextsWithTypes}) {`,
      `  ${rawReturnText}`,
      `}`,
    ];
    let componentStmt: import("ts-morph").Statement;
    if (isVariable) {
      componentStmt = (
        componentDecl as VariableDeclaration
      ).getVariableStatement()!;
    } else {
      componentStmt = componentDecl as FunctionDeclaration;
    }
    const allStmtsBefore = sourceFile.getStatements();
    const originalIndex = allStmtsBefore.findIndex((s) => s === componentStmt);
    componentStmt.remove();
    sourceFile.insertStatements(
      originalIndex >= 0 ? originalIndex : 0,
      funcLines.join("\n") + "\n\n"
    );
    sourceFile.saveSync();
    return sourceFile.getFullText();
  }

  // 13. Collect identifiers declared in logic to return from the hook
  const logicIdentifiers = new Set<string>();
  logicStatements.forEach((stmt) => {
    if (Node.isVariableStatement(stmt)) {
      stmt
        .getDeclarationList()
        .getDeclarations()
        .forEach((decl) => {
          const nameNode = decl.getNameNode();
          if (Node.isIdentifier(nameNode)) {
            logicIdentifiers.add(nameNode.getText());
          } else if (Node.isArrayBindingPattern(nameNode)) {
            nameNode.getElements().forEach((elem) => {
              if (Node.isBindingElement(elem)) {
                const elemName = elem.getNameNode();
                if (Node.isIdentifier(elemName)) {
                  logicIdentifiers.add(elemName.getText());
                }
              }
            });
          }
        });
    }
    if (Node.isFunctionDeclaration(stmt)) {
      const fnName = stmt.getName();
      if (fnName) {
        logicIdentifiers.add(fnName);
      }
    }
  });

  // 14. Build the hook’s FunctionDeclaration (with props type if present)
  const hookName = `use${componentName}State`;
  const hookLines = [
    `function ${hookName}(props${
      paramNames ? `: ${paramTextsWithTypes}` : ""
    }) {`,
  ];
  logicStatements.forEach((stmt) => {
    const txt = stmt.getText();
    hookLines.push(txt.endsWith(";") ? `  ${txt}` : `  ${txt};`);
  });
  hookLines.push(`  return {`);
  Array.from(logicIdentifiers).forEach((identifier, idx, arr) => {
    const comma = idx < arr.length - 1 ? "," : "";
    hookLines.push(`    ${identifier}${comma}`);
  });
  hookLines.push(`  };`);
  hookLines.push(`}`);

  // 15. Build the component’s FunctionDeclaration, calling hook with just names (no types)
  const rawReturnText = returnStatement!.getText();
  const compLines = [
    `function ${componentName}(${paramTextsWithTypes}) {`,
    `  const state = ${hookName}(${paramNames});`,
    `  ${rawReturnText}`,
    `}`,
  ];

  // 16. Remove the original component statement
  let componentStmt: import("ts-morph").Statement;
  if (isVariable) {
    componentStmt = (
      componentDecl as VariableDeclaration
    ).getVariableStatement()!;
  } else {
    componentStmt = componentDecl as FunctionDeclaration;
  }
  const allStmtsBefore = sourceFile.getStatements();
  const originalIndex = allStmtsBefore.findIndex((s) => s === componentStmt);
  componentStmt.remove();

  // 17. Insert hook + component at originalIndex
  const combinedLines = [...hookLines, "", ...compLines];
  sourceFile.insertStatements(
    originalIndex >= 0 ? originalIndex : 0,
    combinedLines.join("\n") + "\n\n"
  );

  // 18. Rewrite any usage of logic identifiers inside the new return to `state.*`
  const updatedFuncs = sourceFile.getFunctions();
  const newCompDecl = updatedFuncs.find((f) => f.getName() === componentName);
  if (newCompDecl) {
    const newBody = newCompDecl.getBody();
    if (newBody && Node.isBlock(newBody)) {
      const newReturn = newBody.getFirstDescendantByKind(
        SyntaxKind.ReturnStatement
      );
      if (newReturn) {
        const retExpr = newReturn.getExpression();
        if (retExpr) {
          Array.from(logicIdentifiers).forEach((varName) => {
            const idents = retExpr
              .getDescendantsOfKind(SyntaxKind.Identifier)
              .filter((id) => id.getText() === varName);
            idents.forEach((identifier) => {
              identifier.replaceWithText(`state.${varName}`);
            });
          });
        }
      }
    }
  }

  // 19. Save and return the final code
  sourceFile.saveSync();
  return sourceFile.getFullText();
}
