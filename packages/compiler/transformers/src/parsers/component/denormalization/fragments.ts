import type { ArrowFunction, Block } from "ts-morph";
import { Node } from "ts-morph";
import {
  findAllIdentifierReferencesInNode,
  rewriteIdentifier,
} from "~/libs/ts/identifier.js";

function injectFragmentsInNode({
  node,
  fragments,
  stack = [],
}: {
  node: Node;
  fragments: Map<string, string>;
  stack?: string[];
}) {
  node.forEachChild((child) => {
    // Look for callExpressions
    if (Node.isCallExpression(child)) {
      const expr = child.getExpression();
      // Check for __fragment calls
      if (Node.isIdentifier(expr) && expr.getText() === "__fragment") {
        const args = child.getArguments();
        if (args.length > 0 && Node.isStringLiteral(args[0])) {
          const fragId = args[0].getLiteralValue();
          if (stack.includes(fragId)) {
            throw new Error(
              `Circular fragment reference detected: ${fragId}. Stack: ${stack.join(" -> ")}`,
            );
          }

          // Check if we have the fragment content
          if (fragments.has(fragId)) {
            // extract namedArgs
            const namedArgs: Record<string, string> = {};
            if (args[1]) {
              const namedArgsNode = args[1];
              if (Node.isObjectLiteralExpression(namedArgsNode)) {
                namedArgsNode.getProperties().forEach((prop) => {
                  if (Node.isPropertyAssignment(prop)) {
                    const name = prop.getName();
                    const value = prop.getInitializer()?.getText();
                    if (value) {
                      namedArgs[name] = value;
                    } else {
                      namedArgs[name] = name; // If no initializer, use the name as value
                    }
                  } else if (Node.isShorthandPropertyAssignment(prop)) {
                    const name = prop.getName();
                    // If it's a shorthand, we assume the value is the same as the name
                    namedArgs[name] = name;
                  }
                });
              }
            }

            // Replace the call with the fragment content
            const content = fragments.get(fragId) || "<></>";
            let paramsCode = Object.keys(namedArgs).join(", ");
            let newNode: Node;
            if (paramsCode) {
              paramsCode = `{${paramsCode}}`;
              const tempFnNode = child.replaceWithText(
                `(${paramsCode}) => (${content})`,
              ) as ArrowFunction;

              const body = tempFnNode.getBody();
              if (!Node.isExpression(body)) {
                throw new Error(
                  `Expected the body of the fragment function to be an expression, but got: ${body.getText()}`,
                );
              }

              const namedParams = tempFnNode.getParameters()[0].getNameNode();
              if (!Node.isObjectBindingPattern(namedParams)) {
                throw new Error(
                  `Expected the first parameter of the fragment function to be an object binding pattern, but got: (${namedParams?.getKindName()}) ${namedParams.getText()}`,
                );
              }

              const belements = namedParams.getElements();

              // replace namedArgs in the function body
              for (const be of belements) {
                const identifier = be.getNameNode();
                if (!Node.isIdentifier(identifier)) {
                  throw new Error(
                    `Expected named parameter to be an identifier, but got: ${identifier.getKindName()} ${identifier.getText()}`,
                  );
                }
                const key = identifier.getText();
                const value = namedArgs[key];

                if (!value) {
                  throw new Error(
                    `No value provided for named parameter "${key}" in fragment "${fragId}". Available named parameters: ${Object.keys(namedArgs).join(", ")}`,
                  );
                }

                const refs = findAllIdentifierReferencesInNode(
                  body,
                  identifier,
                );
                refs.forEach((ref) => {
                  rewriteIdentifier(ref, value);
                });
              }

              // replace the arrow function with its body
              newNode = tempFnNode.replaceWithText(body.getText());
            } else {
              newNode = child.replaceWithText(content);
            }

            return injectFragmentsInNode({
              node: newNode,
              fragments,
              stack: [...stack, fragId],
            });
          } else {
            throw new Error(`Fragment id "${fragId}" not defined.`);
          }
        } else {
          throw new Error(
            `Invalid __fragment call: ${child.getText()}. Expected a string literal as the first argument.`,
          );
        }
      }
    }
    // Recurse
    injectFragmentsInNode({
      node: child,
      fragments,
      stack,
    });
  });
}

export function injectFragments(block: Block) {
  const fragmentContents = new Map<string, string>();

  // Collect all fragments
  for (const stmt of block.getStatements()) {
    if (Node.isExpressionStatement(stmt)) {
      const expr = stmt.getExpression();
      if (Node.isCallExpression(expr)) {
        const callee = expr.getExpression();
        if (
          Node.isIdentifier(callee) &&
          callee.getText() === "__defineFragment"
        ) {
          const args = expr.getArguments();
          if (args.length >= 2 && Node.isStringLiteral(args[0])) {
            const fragId = args[0].getLiteralValue();
            const fn = args[1];
            if (Node.isArrowFunction(fn)) {
              const body = fn.getBody();
              if (Node.isExpression(body)) {
                fragmentContents.set(fragId, body.getText());
              } else {
                throw new Error(
                  `Invalid fragment definition: ${stmt.getText()}. Expected an expression body.`,
                );
              }
            } else {
              throw new Error(
                `Invalid fragment definition: ${stmt.getText()}. Expected an arrow function as the second argument.`,
              );
            }
          } else {
            throw new Error(
              `Invalid fragment definition: ${stmt.getText()}. Expected at least two arguments.`,
            );
          }

          // Remove the fragment definition statement
          stmt.remove();
        }
      }
    }
  }

  // Reembed fragments in the block
  injectFragmentsInNode({
    node: block,
    fragments: fragmentContents,
    stack: [],
  });
}
