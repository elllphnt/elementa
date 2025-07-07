import type {
  Block,
  Expression,
  Identifier,
  SourceFile} from "ts-morph";
import {
  Node,
  SyntaxKind,
} from "ts-morph";
import {
  findNearestIdentifierDeclaration,
  isIdentifierDeclaration,
  isIdentifierReference,
} from "./identifier.js";
import { getEnclosingBlock, isInNode } from "./navigation.js";

export function extractExpressionAsFunction({
  name,
  callee,
  expression,
  targetScope,
  isolated,
  namedParameters = false,
}: {
  name?: string;
  callee: string;
  expression: Expression;
  targetScope: Block | SourceFile;
  isolated?: boolean;
  namedParameters?: boolean; // If true, parameters will be extracted as named parameters
}) {
  const containingStatement = targetScope
    .getStatements()
    .find((s) => isInNode(expression, s));

  const references = expression
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .filter((i) => isIdentifierReference(i));
  if (Node.isIdentifier(expression)) {
    references.push(expression);
  }

  const dependencies = [
    ...new Set(
      references
        .filter((reference) => {
          const declaration = findNearestIdentifierDeclaration(reference);

          if (isolated) {
            return (
              declaration &&
              !isInNode(declaration, expression) &&
              isInNode(declaration, targetScope)
            );
          } else {
            return (
              declaration &&
              !isInNode(declaration, expression) &&
              containingStatement &&
              isInNode(declaration, containingStatement)
            );
          }
        })
        .map((d) => d.getText())
    ),
  ];

  let parametersCode = dependencies.length
    ? `${dependencies.map((i) => i).join(", ")}`
    : "";
  if (namedParameters && parametersCode) {
    parametersCode = `{${parametersCode}}`;
  }
  const functionCode = `function ${
    name || ""
  }(${parametersCode}) { return ${expression.getText()}; }`;
  const referenceCode = `${callee}(${parametersCode})`;

  return {
    functionCode,
    referenceCode,
  };
}

export function extractStatementsAsInlineFunctionExpression({
  statements,
  isReturn,
}: {
  statements: Node[];
  isReturn?: boolean;
}) {
  if (statements.length === 0) {
    throw new Error("No statements provided for extraction.");
  }

  const start = statements[0].getStart();
  const end = statements[statements.length - 1].getEnd();

  function isInStatements(node: Node): boolean {
    return node.getStart() >= start && node.getEnd() <= end;
  }

  // If the statements form a return block, we don't need to extract dependents
  // as there isnt supposed to be any subsequent references
  const dependents = isReturn
    ? []
    : [
        ...new Set(
          statements.flatMap((stmt) =>
            stmt
              // all identifiers in the statement
              .getDescendantsOfKind(SyntaxKind.Identifier)
              // keep identifiers that are declarations and references outside the statements
              .filter((i) => {
                if (!isIdentifierDeclaration(i)) return false;
                const references = ((identifier) => {
                  const block = getEnclosingBlock(identifier);
                  const name = identifier.getText();
                  return block
                    .getDescendantsOfKind(SyntaxKind.Identifier)
                    .filter((ident: Identifier) => {
                      // Check if the identifier matches the name
                      if (ident.getText() !== name) return false;
                      // Check if it's a reference, not a declaration
                      if (isIdentifierDeclaration(ident)) return false;
                      // Ensure the nearest declaration is the same as the given identifier
                      const nearest = findNearestIdentifierDeclaration(ident);
                      return nearest === identifier;
                    });
                })(i);
                // check if any reference is not in the statements
                return references.some((ref) => !isInStatements(ref));
              })
          )
        ),
      ];

  const dependentsCode = dependents.length
    ? `{${dependents.map((i) => i.getText()).join(", ")}}`
    : "";

  const statementCodes = statements.map((stmt) => stmt.getText());
  if (dependentsCode) {
    statementCodes.push(`return ${dependentsCode};`);
  }

  const inlineFunctionCode = [`(() => {`, ...statementCodes, "})()"].join("\n");

  const referenceCode = dependentsCode
    ? `const ${dependentsCode} = ${inlineFunctionCode}`
    : inlineFunctionCode;

  return {
    referenceCode,
  };
}

export function extractStatementsAsFunction({
  name,
  statements,
  targetScope,
  isolated,
  isReturn,
  namedParameters = false, // If true, parameters will be extracted as named parameters
}: {
  name: string;
  statements: Node[];
  targetScope: Block | SourceFile;
  isolated?: boolean;
  isReturn?: boolean;
  namedParameters?: boolean; // If true, parameters will be extracted as named parameters
}) {
  if (statements.length === 0) {
    throw new Error("No statements provided for extraction.");
  }

  const containingStatement = targetScope
    .getStatements()
    .find((s) => isInNode(statements[0], s));

  const start = statements[0].getStart();
  const end = statements[statements.length - 1].getEnd();

  function isInStatements(node: Node): boolean {
    return node.getStart() >= start && node.getEnd() <= end;
  }

  const dependencies = [
    ...new Set(
      statements.flatMap((stmt) =>
        stmt
          // all identifiers in the statement
          .getDescendantsOfKind(SyntaxKind.Identifier)
          // identifiers that are references
          .filter((i) => isIdentifierReference(i))
          // find their nearest declaration
          .map((i) => findNearestIdentifierDeclaration(i))
          // filter out declarations that are not this statements but are in the containing statement of the target scope
          .filter((declaration) => {
            if (isolated) {
              return declaration && !isInStatements(declaration);
            } else {
              return (
                declaration &&
                !isInStatements(declaration) &&
                containingStatement &&
                isInNode(declaration, containingStatement)
              );
            }
          })
      ) as Identifier[]
    ),
  ];

  // If the statements form a return block, we don't need to extract dependents
  // as there isnt supposed to be any subsequent references
  const dependents = isReturn
    ? []
    : [
        ...new Set(
          statements.flatMap((stmt) =>
            stmt
              // all identifiers in the statement
              .getDescendantsOfKind(SyntaxKind.Identifier)
              // keep identifiers that are declarations and references outside the statements
              .filter((i) => {
                if (!isIdentifierDeclaration(i)) return false;
                const references = ((identifier) => {
                  const block = getEnclosingBlock(identifier);
                  const name = identifier.getText();
                  return block
                    .getDescendantsOfKind(SyntaxKind.Identifier)
                    .filter((ident: Identifier) => {
                      // Check if the identifier matches the name
                      if (ident.getText() !== name) return false;
                      // Check if it's a reference, not a declaration
                      if (isIdentifierDeclaration(ident)) return false;
                      // Ensure the nearest declaration is the same as the given identifier
                      const nearest = findNearestIdentifierDeclaration(ident);
                      return nearest === identifier;
                    });
                })(i);
                // check if any reference is not in the statements
                return references.some((ref) => !isInStatements(ref));
              })
          )
        ),
      ];

  let parametersCode = dependencies.length
    ? `${dependencies.map((i) => i.getText()).join(", ")}`
    : "";
  if (namedParameters && parametersCode) {
    parametersCode = `{${parametersCode}}`;
  }
  const dependentsCode = dependents.length
    ? `{${dependents.map((i) => i.getText()).join(", ")}}`
    : "";

  const statementCodes = statements.map((stmt) => stmt.getText());
  if (dependentsCode) {
    statementCodes.push(`return ${dependentsCode};`);
  }

  const functionCode = [
    `function ${name}(${parametersCode}) {`,
    ...statementCodes,
    "}",
  ].join("\n");
  const referenceCode = dependentsCode
    ? `const ${dependentsCode} =${name}(${parametersCode})`
    : `${name}(${parametersCode})`;

  return {
    functionCode,
    referenceCode,
  };
}
