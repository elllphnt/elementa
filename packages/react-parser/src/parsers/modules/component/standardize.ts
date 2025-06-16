import {
  ArrowFunction,
  Block,
  CallExpression,
  FunctionDeclaration,
  FunctionExpression,
  JsxElement,
  JsxFragment,
  JsxSelfClosingElement,
  Node,
  ParameterDeclaration,
  ReturnStatement,
  Statement,
} from "ts-morph";
import { resolveDefaultExportValueNode } from "./utils/export.js";
import {
  extractExpressionAsFunction,
  extractStatementsAsInlineFunctionExpression,
} from "./utils/extraction.js";
import {
  freeNameInScope,
  getUniqueNameInScope,
  rewriteIdentifier,
  rewriteIdentifierReferences,
} from "./utils/identifier.js";
import { getEnclosingBlock } from "./utils/navigation.js";
import { restructureBindingPattern } from "./utils/refactoring.js";
import { hasReturnBranch } from "./utils/return.js";
import { createSingleFileProject } from "./utils/source_file.js";
import {
  addStatementsAfterNode,
  addStatementsBeforeNode,
} from "./utils/statements.js";
import { getValueFromNode } from "./utils/value.js";

export function standardizeComponentProps(node: ParameterDeclaration) {
  const nameNode = node.getNameNode();
  const block = getEnclosingBlock(nameNode);
  if (Node.isObjectBindingPattern(nameNode)) {
    freeNameInScope(block, "props");
    restructureBindingPattern(nameNode, "props");
  } else if (Node.isIdentifier(nameNode)) {
    if (nameNode.getText() !== "props") {
      freeNameInScope(block, "props");
      rewriteIdentifierReferences(nameNode, "props");
      rewriteIdentifier(nameNode, "props");
    }
  } else {
    throw Error(
      `Unexpected node ${node.getKindName()} as props parameter: ${node.getText()}`
    );
  }
}
export function standardizeComponentLegacyRef(node: ParameterDeclaration) {
  const nameNode = node.getNameNode();
  if (Node.isObjectBindingPattern(nameNode)) {
    const id = restructureBindingPattern(nameNode, "ref");
    rewriteIdentifierReferences(id, "props.ref");
  } else if (Node.isIdentifier(nameNode)) {
    rewriteIdentifierReferences(nameNode, "props.ref");
  } else {
    throw Error(
      `Unexpected node ${node.getKindName()} as ref parameter: ${node.getText()}`
    );
  }

  node.remove();
}
export function extractFragment(
  node: JsxFragment | JsxElement | JsxSelfClosingElement,
  targetScope: Block
) {
  // first extract potentially nested fragments
  function extractNestedFragments(nestedNode: Node) {
    if (Node.isJsxExpression(nestedNode)) {
      const expression = nestedNode.getExpression();
      if (expression) {
        extractFragmentsFromNode(expression, targetScope);
      }
    } else {
      const children = nestedNode.getChildren();
      for (const child of children) {
        extractNestedFragments(child);
      }
    }
  }
  extractNestedFragments(node);

  // extract the fragment
  const fragmentName = getUniqueNameInScope(targetScope, "__elll_fragment", 1);
  const { functionCode, referenceCode } = extractExpressionAsFunction({
    name: fragmentName,
    expression: node,
    targetScope,
    isolated: true,
  });
  targetScope.insertStatements(0, functionCode);
  node.replaceWithText(referenceCode);
}
export function extractFragmentsFromNode(node: Node, targetScope: Block) {
  if (
    Node.isJsxFragment(node) ||
    Node.isJsxElement(node) ||
    Node.isJsxSelfClosingElement(node)
  ) {
    extractFragment(node, targetScope);
  } else {
    const children = node.getChildren();
    for (const child of children) {
      extractFragmentsFromNode(child, targetScope);
    }
  }
}

function isFragmentDeclaration(stmt: Statement): boolean {
  if (!Node.isFunctionDeclaration(stmt)) return false;
  const name = stmt.getName();
  return !!name?.startsWith("__elll_fragment_");
}
function isStateDeclarationOrCall(stmt: Statement): boolean {
  if (Node.isVariableStatement(stmt)) {
    const decls = stmt.getDeclarationList().getDeclarations();
    if (decls.length !== 1) return false;
    const init = decls[0].getInitializer();
    if (!init || !Node.isCallExpression(init)) return false;
    const fnText = init.getExpression().getText();

    // Check if all arguments are identifiers
    const allParamsAreIdentifiers = init
      .getArguments()
      .every(
        (arg) =>
          Node.isIdentifier(arg) ||
          Node.isStringLiteral(arg) ||
          Node.isNumericLiteral(arg) ||
          Node.isBooleanKeyword(arg)
      );
    if (!allParamsAreIdentifiers) return false;

    return /^use[A-Z]/.test(fnText);
  } else if (Node.isExpressionStatement(stmt)) {
    const expr = stmt.getExpression();
    if (!Node.isCallExpression(expr)) return false;
    const fnText = expr.getExpression().getText();

    // Check if all arguments are identifiers
    const allParamsAreIdentifiers = expr
      .getArguments()
      .every(
        (arg) =>
          Node.isIdentifier(arg) ||
          Node.isStringLiteral(arg) ||
          Node.isNumericLiteral(arg) ||
          Node.isBooleanKeyword(arg)
      );
    if (!allParamsAreIdentifiers) return false;

    return /^use[A-Z]/.test(fnText);
  }
  return false;
}
function isReturnFragmentOrState(ret: ReturnStatement): boolean {
  const expr = ret.getExpression();
  let callExpr: CallExpression | undefined;

  if (Node.isCallExpression(expr)) {
    callExpr = expr;
  } else if (Node.isParenthesizedExpression(expr)) {
    const innerExpr = expr.getExpression();
    if (Node.isCallExpression(innerExpr)) {
      callExpr = expr.replaceWithText(innerExpr.getText()) as CallExpression;
    } else {
      return false; // Not a call expression
    }
  } else {
    return false;
  }

  const fnText = callExpr.getExpression().getText();

  // Check if all arguments are identifiers
  const allParamsAreIdentifiers = callExpr
    .getArguments()
    .every(
      (arg) =>
        Node.isIdentifier(arg) ||
        Node.isPropertyAccessExpression(arg) ||
        Node.isStringLiteral(arg) ||
        Node.isNumericLiteral(arg) ||
        Node.isBooleanKeyword(arg)
    );
  if (!allParamsAreIdentifiers) return false;

  return fnText.startsWith("__elll_fragment_") || /^use[A-Z]/.test(fnText);
}

export function extractStates(node: Block) {
  const batch: Statement[] = [];
  const statements = node.getStatements();
  let hasReturn = false;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    // 1) If this stmt is a fragment declaration or a hook call, flush any pending batch
    if (isFragmentDeclaration(stmt) || isStateDeclarationOrCall(stmt)) {
      if (batch.length > 0) {
        flushBatch();
      }
      continue;
    }
    // 2) If this stmt has a return branch, check if it returns a fragment or state
    else if (hasReturnBranch(stmt)) {
      if (Node.isReturnStatement(stmt) && isReturnFragmentOrState(stmt)) {
        break;
      } else {
        hasReturn = true;
        batch.push(...statements.slice(i));
        flushBatch();
        break;
      }
    } else {
      batch.push(stmt);
    }
  }

  if (batch.length > 0) {
    flushBatch();
  }

  function flushBatch() {
    if (batch.length === 0) {
      hasReturn = false;
      return;
    }
    const { referenceCode } = extractStatementsAsInlineFunctionExpression({
      statements: batch,
      isReturn: hasReturn,
    });

    const stmt = batch[0].replaceWithText(referenceCode);
    for (let i = 1; i < batch.length; i++) {
      batch[i].remove();
    }

    if (Node.isVariableStatement(stmt)) {
      const decl = stmt.getDeclarationList().getDeclarations()[0];
      const nameNode = decl.getNameNode();
      if (
        Node.isObjectBindingPattern(nameNode) ||
        Node.isArrayBindingPattern(nameNode)
      ) {
        const name = getUniqueNameInScope(node, "state", 1);
        restructureBindingPattern(nameNode, name);
      }

      if (hasReturn) {
        const name = decl.getName();
        addStatementsAfterNode(stmt, `return ${name};`);
      }
    } else if (Node.isExpressionStatement(stmt) && hasReturn) {
      const expr = stmt.getExpression();
      const name = getUniqueNameInScope(node, "state", 1);
      stmt.replaceWithText(
        `const ${name}= ${expr.getText()};\nreturn ${name};`
      );
    }

    batch.length = 0;
    hasReturn = false;
  }
}
export function standardizeComponentFunctionBody(node: Node) {
  let block: Block | undefined;

  if (Node.isBlock(node)) {
    block = node;
  } else if (Node.isExpression(node)) {
    block = node.replaceWithText(`{ return ${node.getText()} }`) as Block;
  } else {
    throw new Error(
      `Unexpected node ${node.getKindName()} as function body: ${node.getText()}`
    );
  }

  extractFragmentsFromNode(block, block);
  extractStates(block);
}
export function standardizeComponentFunction(
  node: ArrowFunction | FunctionExpression | FunctionDeclaration
) {
  const parameters = node.getParameters();
  const body = node.getBody();

  if (parameters.length > 2) {
    throw new Error(`Component Function have more than two parameters.`);
  }

  if (parameters.length > 0) {
    standardizeComponentProps(parameters[0]);
  }
  if (parameters.length > 1) {
    standardizeComponentLegacyRef(parameters[1]);
  }
  if (body) {
    standardizeComponentFunctionBody(body);
  }
}

export function standardizeComponentMemoCallExpression(node: CallExpression) {
  const args = node.getArguments();
  if (args.length !== 1 && args.length !== 2) {
    throw new Error(
      `CallExpression seems to be a memoized component but does not have exactly one or two arguments.`
    );
  }

  let componentNode: Node;
  // eslint-disable-next-line no-constant-condition
  if (0) {
    const componentText = args[0].getText();
    const comparePropsText = args[1]?.getText() as string | undefined;
    componentNode = node.replaceWithText(componentText);
    addStatementsBeforeNode(
      componentNode,
      "__elll_configure_component('memoized');"
    );
    if (comparePropsText) {
      addStatementsBeforeNode(
        componentNode,
        `__elll_configure_component('compareProps', ${comparePropsText});`
      );
    }
  } else {
    componentNode = args[0];
  }

  const fn = getValueFromNode(componentNode);
  if (!fn) {
    throw new Error(
      `Node value could not be resolved in: ${componentNode.getText()}`
    );
  }

  if (Node.isCallExpression(fn.node)) {
    standardizeComponentCallExpression(fn.node);
  } else if (
    Node.isArrowFunction(fn.node) ||
    Node.isFunctionExpression(fn.node) ||
    Node.isFunctionDeclaration(fn.node)
  ) {
    standardizeComponentFunction(fn.node);
  } else {
    throw new Error(
      `Invalid component value ${fn.node.getKindName()}: ${fn.node.getText()}`
    );
  }
}
export function standardizeComponentForwardCallExpression(
  node: CallExpression
) {
  const args = node.getArguments();

  const componentText = args[0].getText();
  const componentNode = node.replaceWithText(componentText);

  if (args.length !== 1) {
    throw new Error(
      `Node value could not be resolved in: ${componentNode.getText()}`
    );
  }
  const fn = getValueFromNode(componentNode);
  if (!fn) {
    throw new Error(
      `Node value could not be resolved in: ${componentNode.getText()}`
    );
  }

  if (Node.isCallExpression(fn.node)) {
    standardizeComponentCallExpression(fn.node);
  } else if (
    Node.isArrowFunction(fn.node) ||
    Node.isFunctionExpression(fn.node) ||
    Node.isFunctionDeclaration(fn.node)
  ) {
    standardizeComponentFunction(fn.node);
  } else {
    throw new Error(
      `Invalid component value ${fn.node.getKindName()}: ${fn.node.getText()}`
    );
  }
}
export function standardizeComponentCallExpression(node: CallExpression) {
  const callee = node.getFirstChild();
  let calleeName: string | undefined;
  if (Node.isIdentifier(callee)) {
    calleeName = callee.getText();
  } else if (Node.isPropertyAccessExpression(callee)) {
    calleeName = callee.getName();
  }

  if (calleeName === "memo") {
    standardizeComponentMemoCallExpression(node);
  } else if (calleeName === "forwardRef") {
    standardizeComponentForwardCallExpression(node);
  } else {
    throw new Error(`Unexpected call expression as component: ${calleeName}.`);
  }
}

export function standardizeComponent(sourceCode: string): string {
  const { sourceFile } = createSingleFileProject(sourceCode, {
    name: "component.tsx",
  });
  const defaultExport = resolveDefaultExportValueNode(sourceFile);
  if (!defaultExport) {
    throw new Error("No default export value found.");
  }
  const { node } = defaultExport;

  if (Node.isCallExpression(node)) {
    standardizeComponentCallExpression(node);
  } else if (
    Node.isArrowFunction(node) ||
    Node.isFunctionExpression(node) ||
    Node.isFunctionDeclaration(node)
  ) {
    standardizeComponentFunction(node);
  } else {
    throw new Error(`Default export is not a valid function.`);
  }

  sourceFile.saveSync();
  sourceFile.formatText({
    indentSize: 2,
    convertTabsToSpaces: true,
    newLineCharacter: "\n",
  });
  return sourceFile.getFullText();
}
