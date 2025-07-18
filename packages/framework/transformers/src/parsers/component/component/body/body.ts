import { genId, type ComponentData } from "@elllphnt/elementa-base";
import type {
  ArrowFunction,
  Expression,
  FunctionDeclaration,
  FunctionExpression,
} from "ts-morph";
import { Node } from "ts-morph";
import { isHookName } from "~/libs/ts/code.js";
import { getDeepExpression } from "~/libs/ts/expression.js";
import { parseElementsFromNode } from "../../element/element.js";
import type { ParseElementContext } from "../../element/utils/types.js";
import type { ParseComponentContext } from "../type.js";
import { parseFragmentDefinition } from "./fragments.js";
import { parseInlineStateExpression, parseStateExpression } from "./states.js";

export function parseComponentFunctionBody({
  node,
  componentData,
  context,
}: {
  node: ArrowFunction | FunctionExpression | FunctionDeclaration;
  componentData: ComponentData;
  context: ParseComponentContext;
}) {
  const body = node.getBody();
  if (!Node.isBlock(body)) {
    throw Error(
      `Expected a block body for component function, got ${body?.getKindName()}`,
    );
  }

  const elementContext: ParseElementContext = {
    createFragment: ({ content }) => ({
      id: genId(),
      content,
    }),
    scope: node,
    getStyleClass: context.getStyleClass,
  };

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
              scope: node,
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
        let callee: Expression = expression.getExpression();
        while (Node.isParenthesizedExpression(callee)) {
          callee = callee.getExpression();
        }

        const calleeName = callee?.getText();

        if (Node.isArrowFunction(callee) || Node.isFunctionExpression(callee)) {
          const state = parseInlineStateExpression({
            fn: callee,
          });
          componentData.states = [...(componentData.states || []), state];
        } else if (calleeName && isHookName(calleeName)) {
          // Handle state_x(...)
          const state = parseStateExpression({
            call: expression,
            scope: node,
          });
          componentData.states = [...(componentData.states || []), state];
        } else if (calleeName === "__defineFragment") {
          // Handle __defineFragment("id", ({...})=><>...</>)
          const fragment = parseFragmentDefinition({
            node: expression,
            context: elementContext,
          });
          componentData.fragments = [
            ...(componentData.fragments || []),
            fragment,
          ];
        } else {
          throw Error(
            `Unexpected call expression statement: ${expression.getText()}`,
          );
        }
      } else {
        throw Error(
          `Unexpected ${expression.getKindName()} in expression statement: ${expression.getText()}`,
        );
      }
    } else if (Node.isReturnStatement(statement)) {
      let returnExpr = statement.getExpression();
      if (!returnExpr) {
        continue; // Skip empty return statements
      }
      returnExpr = getDeepExpression(returnExpr);

      if (Node.isCallExpression(returnExpr)) {
        componentData.content = [
          {
            id: genId(),
            type: "expression",
            expression: returnExpr.getText(),
          },
        ];
      } else if (
        Node.isJsxElement(returnExpr) ||
        Node.isJsxFragment(returnExpr) ||
        Node.isJsxSelfClosingElement(returnExpr)
      ) {
        componentData.content = parseElementsFromNode({
          node: returnExpr,
          context: elementContext,
        });
      } else {
        throw Error(
          `Unexpected return expression type: ${returnExpr.getKindName()}`,
        );
      }
    } else {
      throw Error(
        `Unexpected statement in component function body: ${statement.getKindName()}`,
      );
    }
  }
}
