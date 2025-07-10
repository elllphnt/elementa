import type {
  ArrowFunction,
  Block,
  FunctionExpression,
  Identifier,
} from "ts-morph";
import { Node } from "ts-morph";
import {
  findAllIdentifierReferences,
  freeNameInScopeWithOmit,
  getBlockIdentifiersDeclarations,
  rewriteIdentifier,
} from "~/libs/ts/identifier.js";
import { getEnclosingBlock } from "~/libs/ts/navigation.js";
import { hasReturnBranch } from "~/libs/ts/return.js";

function getIIFEReturnInterface(
  node: ArrowFunction | FunctionExpression,
): string | string[] | Record<string, string> | undefined {
  const body = node.getBody();
  if (!Node.isBlock(body)) {
    return undefined;
  }

  const statements = body.getStatements();
  const lastStatement = statements[statements.length - 1];
  if (!Node.isReturnStatement(lastStatement)) {
    return undefined; // Last statement is not a return statement
  }
  const returnExpr = lastStatement.getExpression();
  if (Node.isObjectLiteralExpression(returnExpr)) {
    const properties = returnExpr.getProperties();
    const interfaceProps: Record<string, string> = {};
    for (const prop of properties) {
      if (Node.isPropertyAssignment(prop)) {
        const name = prop.getName();
        const value = prop.getInitializer()?.getText() || name;
        interfaceProps[name] = value;
      } else if (Node.isShorthandPropertyAssignment(prop)) {
        // Shorthand property assignment, use the name as both key and value
        const name = prop.getName();
        interfaceProps[name] = name;
      } else {
        // if a property is not a PropertyAssignment or ShorthandPropertyAssignment,
        // we cannot determine the interface of the IIFE
        return undefined;
      }
    }
    return interfaceProps;
  } else if (Node.isArrayLiteralExpression(returnExpr)) {
    const items: string[] = [];
    for (const el of returnExpr.getElements()) {
      if (Node.isSpreadElement(el)) {
        // If it's a spread element, we cannot determine the interface of the IIFE
        return undefined;
      } else {
        items.push(el.getText());
      }
    }
    return items;
  } else if (
    Node.isIdentifier(returnExpr) ||
    Node.isLiteralExpression(returnExpr)
  ) {
    return returnExpr.getText(); // Return the expression as a string
  }
}

function applyIIFEInterface(
  identifier: Identifier,
  intrfce: Record<string, string> | string[] | string,
): boolean {
  if (typeof intrfce === "string") {
    const refs = findAllIdentifierReferences(identifier);
    refs.forEach((ref) => {
      rewriteIdentifier(ref, intrfce);
    });
    return true;
  } else if (Array.isArray(intrfce)) {
    const refs = findAllIdentifierReferences(identifier);
    for (const ref of refs) {
      const parent = ref.getParent();
      if (!Node.isElementAccessExpression(parent)) {
        return false; // Cannot apply array interface to non-element access
      }

      const index = parent.getArgumentExpression();
      if (!Node.isNumericLiteral(index)) {
        return false; // Cannot apply array interface to non-numeric index
      }
      const indexValue = index.getLiteralValue();
      const value = intrfce[indexValue];
      if (value === undefined) {
        return false; // Index out of bounds
      }
      parent.replaceWithText(value);
    }
    return true; // Successfully applied array interface
  } else if (typeof intrfce === "object") {
    const refs = findAllIdentifierReferences(identifier);
    for (const ref of refs) {
      const parent = ref.getParent();
      if (Node.isPropertyAccessExpression(parent)) {
        const propName = parent.getName();
        const value = intrfce[propName];
        if (value === undefined) {
          return false; // Property not found in interface
        }
        parent.replaceWithText(value);
      } else if (Node.isElementAccessExpression(parent)) {
        const index = parent.getArgumentExpression();
        if (!Node.isStringLiteral(index) || !Node.isNumericLiteral(index)) {
          return false; // Cannot apply object interface to non-string index
        }
        const key = index.getLiteralValue();
        const value = intrfce[key];
        if (value === undefined) {
          return false; // Key not found in interface
        }
        parent.replaceWithText(value);
      }
    }
    return true; // Successfully applied object interface
  } else {
    return false; // Unsupported interface type
  }
}

function releaseIIFEStatements(
  node: FunctionExpression | ArrowFunction,
  withReturn?: boolean,
): string[] {
  const body = node.getBody();
  if (!Node.isBlock(body)) {
    throw new Error(
      `Expected IIFE body to be a block, but got: ${body.getKindName()}`,
    );
  }
  const ids = getBlockIdentifiersDeclarations(body);
  const scope = getEnclosingBlock(node);
  for (const id of ids) {
    freeNameInScopeWithOmit({ scope, name: id.getText(), omitNode: node });
  }
  let statements = body.getStatements();
  if (!withReturn) {
    statements = statements.filter((stmt) => !Node.isReturnStatement(stmt));
  }

  return statements.map((stmt) => {
    return stmt.getText();
  });
}

export function unwrapIIFEStates(block: Block) {
  const statements = block.getStatements();
  const beforeLastStatement = statements[statements.length - 2];
  const lastStatement = statements[statements.length - 1];
  let returnedIdentifier: string | null = null;

  if (Node.isReturnStatement(lastStatement)) {
    const returnExpr = lastStatement.getExpression();
    returnedIdentifier = Node.isIdentifier(returnExpr)
      ? returnExpr.getText()
      : null;
  }

  // find and unwrap IIFEs
  for (const stmt of block.getStatements()) {
    // Handle `const x = (() => { ...; return v; })();`
    if (Node.isVariableStatement(stmt)) {
      const decls = stmt.getDeclarationList().getDeclarations();
      if (decls.length === 1) {
        const decl = decls[0];
        const init = decl.getInitializer();
        if (init && Node.isCallExpression(init)) {
          const callee = init.getExpression();
          if (Node.isParenthesizedExpression(callee)) {
            const inner = callee.getExpression();
            if (
              Node.isArrowFunction(inner) ||
              Node.isFunctionExpression(inner)
            ) {
              const nameNode = decl.getNameNode();
              if (!Node.isIdentifier(nameNode)) {
                throw new Error(
                  `Expected IIFE state declaration to have an identifier name, but got: ${nameNode.getKindName()}`,
                );
              }

              const isReturned = nameNode.getText() === returnedIdentifier;
              if (isReturned && stmt === beforeLastStatement) {
                const stmts = releaseIIFEStatements(inner, true);
                stmt.replaceWithText(stmts.join("\n"));
              } else {
                const interfaceProps = getIIFEReturnInterface(inner);
                if (interfaceProps) {
                  const applied = applyIIFEInterface(nameNode, interfaceProps);
                  if (applied) {
                    const stmts = releaseIIFEStatements(inner);
                    stmt.replaceWithText(stmts.join("\n"));
                  }
                }
              }
            }
          }
        }
      }
    } else if (Node.isExpressionStatement(stmt)) {
      // Handle standalone IIFE expressions: `(() => { ... })();`
      const expr = stmt.getExpression();
      if (Node.isCallExpression(expr)) {
        const callee = expr.getExpression();
        if (Node.isParenthesizedExpression(callee)) {
          const inner = callee.getExpression();
          if (Node.isArrowFunction(inner) || Node.isFunctionExpression(inner)) {
            if (!hasReturnBranch(inner.getBody())) {
              const stmts = releaseIIFEStatements(inner);
              stmt.replaceWithText(stmts.join("\n"));
            }
          }
        }
      }
    }
  }
}
