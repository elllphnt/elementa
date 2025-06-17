import {
  ComponentData,
  DataInputData,
  FragmentData,
  FragmentElementData,
  StateData,
} from "@elllphnt/elementa-base";
import {
  ArrowFunction,
  CallExpression,
  Expression,
  FunctionDeclaration,
  FunctionExpression,
  Node,
} from "ts-morph";
import { ComponentNode, isComponentNode, isHookName } from "../modules/_.js";
import { GetStylesheet, parseElementsFromJSX } from "./element/_.js";
import { genId } from "./utils.js";

export function parseArguments({
  node,
  argModeNamed,
}: {
  node: CallExpression;
  argModeNamed?: boolean;
}): {
  args: Record<string, any>;
  argMode: "positional" | "named";
} {
  const args: Record<string, any> = {};
  const callArgs = node.getArguments();

  if (callArgs.length === 1 && Node.isObjectLiteralExpression(callArgs[0])) {
    // Named arguments mode
    const obj = callArgs[0];
    obj.getProperties().forEach((prop) => {
      if (Node.isPropertyAssignment(prop)) {
        const name = prop.getName();
        const initializer = prop.getInitializer();
        if (initializer) {
          if (Node.isStringLiteral(initializer)) {
            args[name] = initializer.getLiteralValue();
          } else if (Node.isNumericLiteral(initializer)) {
            args[name] = initializer.getLiteralValue();
          } else if (Node.isNullLiteral(initializer)) {
            args[name] = null;
          } else if (Node.isBooleanKeyword(initializer)) {
            args[name] = initializer.getText() === "true";
          } else if (Node.isExpression(initializer)) {
            args[name] = {
              __expression: (initializer as Expression).getText(),
            };
          }
        }
      } else if (Node.isShorthandPropertyAssignment(prop)) {
        const name = prop.getName();
        args[name] = name;
      }
    });
    return { args, argMode: "named" };
  } else {
    if (argModeNamed) {
      throw Error(
        `Expected named arguments, but received positional arguments: ${callArgs
          .map((arg) => arg.getText())
          .join(", ")}`
      );
    }

    // Positional arguments mode
    callArgs.forEach((arg, idx) => {
      args[idx] = arg.getText();
    });
    return { args, argMode: "positional" };
  }
}

export function parseComponentFunctionParams({
  node,
  componentData,
}: {
  node: ArrowFunction | FunctionExpression | FunctionDeclaration;
  componentData: ComponentData;
}) {
  const params = node.getParameters();
  const propsInputs: DataInputData[] = [];
  if (params.length > 0) {
    const p = params[0];
    const paramType = p.getType();

    if (paramType.isObject()) {
      // Extract each property from the props type
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
        // eslint-disable-next-line no-constant-condition, no-constant-binary-expression
        if (0 && !tsType) {
          // Fallback: get the textual representation from the resolved type
          tsType = propSymbol.getTypeAtLocation(decl).getText();
        }

        // Determine if the property is required (no question token)
        const required = !(
          (Node.isPropertySignature(decl) && decl.hasQuestionToken()) ||
          (Node.isPropertyDeclaration(decl) && decl.hasQuestionToken())
        );

        propsInputs.push({
          name: propName,
          varName: propName,
          tsType,
          required,
          defaultValue: undefined,
        });
      }
    }
  }
  componentData.props = propsInputs;
}

export function parseFragmentFunctionParams({
  node,
  fragmentData,
}: {
  node: FunctionExpression | ArrowFunction | FunctionDeclaration;
  fragmentData: FragmentData;
}) {
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

  if (fragmentParams.length > 0) {
    fragmentData.params = fragmentParams;
  }
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

export function parseFragmentFunction({
  id,
  node,
  getStylesheet,
}: {
  id: string;
  node: FunctionExpression | ArrowFunction;
  getStylesheet: GetStylesheet;
}): FragmentData {
  const fragmentData: FragmentData = {
    id,
  };

  parseFragmentFunctionParams({ node, fragmentData });
  parseFragmentFunctionBody({ node, fragmentData, getStylesheet });

  return fragmentData;
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
export function parseFragmentExpression({
  fragmentId,
  call,
}: {
  fragmentId: string;
  call: CallExpression;
}): FragmentElementData {
  const args = parseArguments({ node: call, argModeNamed: true });
  const elementData: FragmentElementData = {
    id: genId(),
    type: "fragment",
    fragmentId,
    params: args.args,
  };
  return elementData;
}

export function parseComponentFunctionBody({
  node,
  componentData,
  getStylesheet,
}: {
  node: ArrowFunction | FunctionExpression | FunctionDeclaration;
  componentData: ComponentData;
  getStylesheet: GetStylesheet;
}) {
  const body = node.getBody();
  if (!Node.isBlock(body)) {
    throw Error(
      `Expected a block body for component function, got ${body?.getKindName()}`
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
        const nameNode = decl.getNameNode();
        if (nameNode.getText() === "fragments") {
          continue; // Skip fragments variable declaration
        }

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
              `Unexpected CallExpression in variable declaration: ${calleeName}`
            );
          }
        } else {
          throw Error(
            `Unexpected initializer in variable declaration: ${initializer?.getText()}`
          );
        }
      }
    } else if (Node.isExpressionStatement(statement)) {
      const expression = statement.getExpression();
      if (Node.isCallExpression(expression)) {
        const callee = expression.getFirstChild();
        const calleeName = callee?.getText();
        if (calleeName && isHookName(calleeName)) {
          const state = parseStateExpression({
            call: expression,
          });
          componentData.states = [...(componentData.states || []), state];
        } else {
          throw Error(
            `Unexpected CallExpression in expression statement: ${callee?.getText()}`
          );
        }
      } else if (Node.isBinaryExpression(expression)) {
        // Handle fragments.fragment_n = function ({...}) {...}
        const left = expression.getLeft();
        const right = expression.getRight();
        const operator = expression.getOperatorToken().getText();
        if (operator !== "=") {
          throw Error(
            `Unexpected binary expression operator in component body: ${operator}`
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
            `Unexpected ${left.getKindName()} left side of binary expression in component body: ${left.getText()}`
          );
        }
        if (leftPart1.getText() !== "fragments") {
          throw Error(
            `Unexpected left side of binary expression in component body: ${left.getText()}`
          );
        }
        let name: string | undefined;
        if (Node.isIdentifier(leftPart2)) {
          name = leftPart2.getText();
        } else if (Node.isStringLiteral(leftPart2)) {
          name = leftPart2.getLiteralValue();
        } else {
          throw Error(
            `Unexpected left side of binary expression in component body: ${left.getText()}`
          );
        }

        if (!Node.isFunctionExpression(right) && !Node.isArrowFunction(right)) {
          throw Error(
            `Unexpected right side of binary expression in component body: ${right.getText()}`
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
          `Unexpected ${expression.getKindName()} in expression statement: ${expression.getText()}`
        );
      }
    } else if (Node.isReturnStatement(statement)) {
      const returnExpr = statement.getExpression();
      if (returnExpr && Node.isCallExpression(returnExpr)) {
        const callee = returnExpr.getFirstChild();
        const calleeName = callee?.getText();
        if (
          Node.isPropertyAccessExpression(callee) &&
          calleeName?.startsWith("fragments.")
        ) {
          const fragmentName = callee.getNameNode().getText();
          componentData.template = parseFragmentExpression({
            fragmentId: getFragmentId(fragmentName),
            call: returnExpr,
          });
        } else if (
          Node.isElementAccessExpression(callee) &&
          calleeName?.startsWith("fragments")
        ) {
          const fragmentName = callee.getArgumentExpression()?.getText();
          if (!fragmentName) {
            throw Error(
              `Expected a fragment name in element access expression: ${callee.getText()}`
            );
          }
          componentData.template = {
            id: genId(),
            type: "fragment",
            fragmentId: getFragmentId(fragmentName),
          };
        } else {
          componentData.template = {
            id: genId(),
            type: "expression",
            expression: returnExpr.getText(),
          };
        }
      } else if (returnExpr) {
        componentData.template = {
          id: genId(),
          type: "expression",
          expression: returnExpr.getText(),
        };
      }
    } else {
      throw Error(
        `Unexpected statement in component function body: ${statement.getKindName()}`
      );
    }
  }
}

export function parseComponentFunction({
  node,
  getStylesheet,
  init,
}: {
  node: ArrowFunction | FunctionExpression | FunctionDeclaration;
  getStylesheet: GetStylesheet;
  init?: ComponentData;
}): ComponentData {
  const componentData: ComponentData = { ...init };
  parseComponentFunctionParams({ node, componentData });
  parseComponentFunctionBody({ node, componentData, getStylesheet });
  return componentData;
}

export function parseComponent({
  node,
  getStylesheet,
  init,
}: {
  node: ComponentNode;
  getStylesheet: GetStylesheet;
  init?: ComponentData;
}): ComponentData {
  if (Node.isCallExpression(node)) {
    const callee = node.getFirstChild();
    let calleeName: string | undefined;
    if (Node.isIdentifier(callee)) {
      calleeName = callee.getText();
    } else if (Node.isPropertyAccessExpression(callee)) {
      calleeName = callee.getName();
    }
    if (calleeName === "memo") {
      const expression = node.getExpression();
      if (isComponentNode(expression)) {
        return parseComponent({ node: expression, getStylesheet, init });
      } else {
        throw Error(`Unexpected expression in memo ${expression.getText()}`);
      }
    } else {
      throw Error(`Unexpected CallExpression as component ${calleeName}(...)`);
    }
  } else {
    return parseComponentFunction({ node, getStylesheet, init });
  }
}
