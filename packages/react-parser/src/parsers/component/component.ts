import {
  ComponentData,
  DataInputData,
  FragmentData,
  StateData,
} from "@elllphnt/elementa-base";
import {
  ArrowFunction,
  FunctionDeclaration,
  FunctionExpression,
  Node,
} from "ts-morph";
import { ComponentNode, isComponentNode, isHookName } from "../modules/_.js";
import { GetStylesheet, parseElementsFromJSX } from "./element/_.js";
import { genId } from "./utils.js";

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
  node: FunctionDeclaration;
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
        if (!tsType) {
          // Fallback: get the textual representation from the resolved type
          tsType = propSymbol.getTypeAtLocation(decl).getText();
        }

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
  node: FunctionDeclaration;
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
  node: FunctionDeclaration;
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
  callee,
}: {
  name?: string;
  callee: string;
}): StateData {
  const stateData: StateData = {
    id: genId(),
    name: name || "",
    varName: name || "",
    type: "hook",
    hookUrl: {
      __dependency: callee,
    } as any,
  };
  return stateData;
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
    if (Node.isFunctionDeclaration(statement)) {
      const name = statement.getName();
      if (!name?.startsWith("__elll_fragment_")) {
        throw Error(
          `Unexpected function declaration in component body: ${name}`
        );
      }

      const fragmentId = getFragmentId(name);
      const fragmentData = parseFragmentFunction({
        id: fragmentId,
        node: statement,
        getStylesheet,
      });
      componentData.fragments = [
        ...(componentData.fragments || []),
        fragmentData,
      ];
    } else if (Node.isVariableStatement(statement)) {
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
          } else if (!calleeName || !isHookName(calleeName)) {
            throw Error(
              `Unexpected CallExpression in variable declaration: ${calleeName}`
            );
          } else {
            const name = decl.getName();
            const state = parseStateExpression({
              name,
              callee: calleeName,
            });
            componentData.states = [...(componentData.states || []), state];
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
        if (Node.isIdentifier(callee) && isHookName(callee.getText())) {
          const state = parseStateExpression({
            callee: callee.getText(),
          });
          componentData.states = [...(componentData.states || []), state];
        } else {
          throw Error(
            `Unexpected CallExpression in expression statement: ${callee?.getText()}`
          );
        }
      } else {
        throw Error(
          `Unexpected expression in expression statement: ${expression.getText()}`
        );
      }
    } else if (Node.isReturnStatement(statement)) {
      const returnExpr = statement.getExpression();
      if (returnExpr && Node.isCallExpression(returnExpr)) {
        const callee = returnExpr.getFirstChild();
        const calleeName = callee?.getText();
        if (calleeName?.startsWith("__elll_fragment_")) {
          componentData.template = {
            id: getFragmentId(calleeName),
            type: "fragment",
            fragmentId: getFragmentId(calleeName),
          };
        } else {
          componentData.template = {
            id: genId(),
            type: "expression",
            expression: returnExpr.getText(),
          };
        }
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
