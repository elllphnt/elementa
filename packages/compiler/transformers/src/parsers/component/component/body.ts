import type {
  DataInputData,
  FragmentData,
  StateData,
} from "@elllphnt/elementa-base";
import { genId, type ComponentData } from "@elllphnt/elementa-base";
import type {
  ArrowFunction,
  CallExpression,
  FunctionDeclaration,
  FunctionExpression,
} from "ts-morph";
import { Node } from "ts-morph";
import { parseArguments } from "~/libs/ts/args.js";
import { isHookName } from "~/libs/ts/code.js";
import type { GetStylesheet } from "../element/_.js";
import { parseElementsFromJSX } from "../element/_.js";

export function parseFragmentFunctionParams(
  node: FunctionExpression | ArrowFunction | FunctionDeclaration,
) {
  const params = node.getParameters();
  const fragmentParams: DataInputData[] = [];

  if (params.length > 0) {
    const p = params[0];
    const paramType = p.getType();

    if (paramType.isObject()) {
      // Extract each property from the params type
      for (const propSymbol of paramType.getProperties()) {
        const declarations = propSymbol.getDeclarations();
        const decl = declarations[0];
        const propName = propSymbol.getName();

        // Determine the TypeScript type of the property
        let tsType: string | undefined;
        if (
          Node.isPropertySignature(decl) ||
          Node.isPropertyDeclaration(decl)
        ) {
          const typeNode = decl.getTypeNode();
          tsType = typeNode?.getText();
        }
        // if (!tsType) {
        //   // Fallback: get the textual representation from the resolved type
        //   tsType = propSymbol.getTypeAtLocation(decl).getText();
        // }

        // Determine if the property is required (no question token)
        const required = !(
          (Node.isPropertySignature(decl) && decl.hasQuestionToken()) ||
          (Node.isPropertyDeclaration(decl) && decl.hasQuestionToken())
        );

        fragmentParams.push({
          name: propName,
          varName: propName,
          tsType,
          required,
          defaultValue: undefined,
        });
      }
    }
  }

  return fragmentParams;
}
export function parseFragmentFunctionBody({
  node,
  fragmentData,
  getStylesheet,
}: {
  node: FunctionExpression | ArrowFunction | FunctionDeclaration;
  fragmentData: FragmentData;
  getStylesheet: GetStylesheet;
}) {
  const body = node.getBody();
  if (!Node.isBlock(body)) {
    throw Error(`Unexpected fragment body type: ${body?.getKindName()}`);
  }
  const statements = body.getStatements();
  const returnStatement = statements[0];
  if (statements.length !== 1 || !Node.isReturnStatement(returnStatement)) {
    throw Error(`Only 1 return statement is allowed in Fragment function body`);
  }

  const expression = returnStatement.getExpression();
  if (expression) {
    const content = parseElementsFromJSX({
      code: expression.getText(),
      getStylesheet,
      createFragment: ({ content }) => ({
        id: genId(),
        content,
      }),
    });
    fragmentData.content = content;
  }
}
export function parseInlineStateExpression({
  name,
  fn,
}: {
  name?: string;
  fn: ArrowFunction | FunctionExpression;
}): StateData {
  const stateData: StateData = {
    id: genId(),
    name: name || "",
    varName: name || "",
    type: "inline",
    script: fn.getBodyText(),
  };
  return stateData;
}
export function parseStateExpression({
  name,
  call,
}: {
  name?: string;
  call: CallExpression;
}): StateData {
  const args = parseArguments({ node: call });
  const callee = call.getFirstChild()?.getText();
  const stateData: StateData = {
    id: genId(),
    name: name || "",
    varName: name || "",
    type: "hook",
    argMode: args.argMode,
    args: args.args,
    hookUrl: {
      __dependency: callee,
    } as any,
  };
  return stateData;
}
export function parseFragmentDefinition({
  node,
}: {
  node: CallExpression;
}): FragmentData {
  const argNodes = node.getArguments();
  const idNode = argNodes[0];
  if (!Node.isStringLiteral(idNode)) {
    throw Error(
      `Expected first argument of __defineFragment to be a string literal, got ${idNode.getKindName()}`,
    );
  }
  const id = idNode.getLiteralValue();

  const fnNode = argNodes[1];
  if (!Node.isArrowFunction(fnNode)) {
    throw Error(
      `Expected second argument of __defineFragment to be an arrow function, got ${fnNode.getKindName()}`,
    );
  }

  const fragmentData: FragmentData = {
    id,
  };

  parseFragmentFunctionParams({ node, fragmentData });
  parseFragmentFunctionBody({ node, fragmentData, getStylesheet });
}
export function parseComponentFunctionBody({
  node,
  componentData,
}: {
  node: ArrowFunction | FunctionExpression | FunctionDeclaration;
  componentData: ComponentData;
}) {
  const body = node.getBody();
  if (!Node.isBlock(body)) {
    throw Error(
      `Expected a block body for component function, got ${body?.getKindName()}`,
    );
  }

  const fragmentIdMap: Record<string, string> = {};
  function getFragmentId(name: string): string {
    let id = fragmentIdMap[name];
    if (!id) {
      id = genId();
      fragmentIdMap[name] = id;
    }
    return id;
  }

  for (const statement of body.getStatements()) {
    if (Node.isVariableStatement(statement)) {
      const declarations = statement.getDeclarations();
      for (const decl of declarations) {
        const initializer = decl.getInitializer();
        if (Node.isCallExpression(initializer)) {
          let callee = initializer.getFirstChild();
          while (Node.isParenthesizedExpression(callee)) {
            callee = callee.getExpression();
          }
          const calleeName = callee?.getText();
          // Check for inline state pattern: (()=>{...script})()
          if (
            Node.isArrowFunction(callee) ||
            Node.isFunctionExpression(callee)
          ) {
            const name = decl.getName();
            const state = parseInlineStateExpression({
              name,
              fn: callee,
            });
            componentData.states = [...(componentData.states || []), state];
          } else if (calleeName && isHookName(calleeName)) {
            const name = decl.getName();
            const state = parseStateExpression({
              name,
              call: initializer,
            });
            componentData.states = [...(componentData.states || []), state];
          } else {
            throw Error(
              `Unexpected CallExpression in variable declaration: ${calleeName}`,
            );
          }
        } else {
          throw Error(
            `Unexpected initializer in variable declaration: ${initializer?.getText()}`,
          );
        }
      }
    } else if (Node.isExpressionStatement(statement)) {
      const expression = statement.getExpression();
      if (Node.isCallExpression(expression)) {
        const callee = expression.getExpression();
        const calleeName = callee?.getText();
        if (calleeName && isHookName(calleeName)) {
          const state = parseStateExpression({
            call: expression,
          });
          componentData.states = [...(componentData.states || []), state];
        } else if (calleeName === "__defineFragment") {
          // Handle __defineFragment("id", ({...})=><>...</>)
          const fragment = parseFragmentDefinition({
            node: expression,
          });
        }
      } else if (Node.isBinaryExpression(expression)) {
        // Handle fragments.fragment_n = function ({...}) {...}
        const left = expression.getLeft();
        const right = expression.getRight();
        const operator = expression.getOperatorToken().getText();
        if (operator !== "=") {
          throw Error(
            `Unexpected binary expression operator in component body: ${operator}`,
          );
        }
        // For fragments.fragment_n or fragments["fragment_n"], extract the two identifiers
        let leftPart1, leftPart2;
        if (Node.isPropertyAccessExpression(left)) {
          leftPart1 = left.getExpression();
          leftPart2 = left.getNameNode();
        } else if (Node.isElementAccessExpression(left)) {
          leftPart1 = left.getExpression();
          leftPart2 = left.getArgumentExpression();
        } else {
          throw Error(
            `Unexpected ${left.getKindName()} left side of binary expression in component body: ${left.getText()}`,
          );
        }
        if (leftPart1.getText() !== "fragments") {
          throw Error(
            `Unexpected left side of binary expression in component body: ${left.getText()}`,
          );
        }
        let name: string | undefined;
        if (Node.isIdentifier(leftPart2)) {
          name = leftPart2.getText();
        } else if (Node.isStringLiteral(leftPart2)) {
          name = leftPart2.getLiteralValue();
        } else {
          throw Error(
            `Unexpected left side of binary expression in component body: ${left.getText()}`,
          );
        }
        if (!Node.isFunctionExpression(right) && !Node.isArrowFunction(right)) {
          throw Error(
            `Unexpected right side of binary expression in component body: ${right.getText()}`,
          );
        }
        const fragmentId = getFragmentId(name);
        const fragmentData = parseFragmentFunction({
          id: fragmentId,
          node: right,
          getStylesheet,
        });
        fragmentData.name = name;
        fragmentData.varName = name;
        componentData.fragments = [
          ...(componentData.fragments || []),
          fragmentData,
        ];
      } else {
        throw Error(
          `Unexpected ${expression.getKindName()} in expression statement: ${expression.getText()}`,
        );
      }
    } else if (Node.isReturnStatement(statement)) {
      const returnExpr = statement.getExpression();
      if (!returnExpr) {
        continue; // Skip empty return statements
      }

      if (Node.isCallExpression(returnExpr)) {
        const callee = returnExpr.getFirstChild();
        const calleeName = callee?.getText();
        if (
          Node.isPropertyAccessExpression(callee) &&
          calleeName?.startsWith("fragments.")
        ) {
          const fragmentName = callee.getNameNode().getText();
          componentData.content = [
            // parseFragmentExpression({
            //   fragmentId: getFragmentId(fragmentName),
            //   call: returnExpr,
            // }),
          ];
        } else if (
          Node.isElementAccessExpression(callee) &&
          calleeName?.startsWith("fragments")
        ) {
          const fragmentName = callee.getArgumentExpression()?.getText();
          if (!fragmentName) {
            throw Error(
              `Expected a fragment name in element access expression: ${callee.getText()}`,
            );
          }
          componentData.content = [
            {
              id: genId(),
              type: "fragment",
              fragmentId: getFragmentId(fragmentName),
            },
          ];
        } else {
          componentData.content = [
            {
              id: genId(),
              type: "expression",
              expression: returnExpr.getText(),
            },
          ];
        }
      } else {
        componentData.content = parseElementsFromJSX({
          code: returnExpr.getText(),
          createFragment: ({ content }) => ({
            id: genId(),
            content,
          }),
        });
      }
    } else {
      throw Error(
        `Unexpected statement in component function body: ${statement.getKindName()}`,
      );
    }
  }
}
