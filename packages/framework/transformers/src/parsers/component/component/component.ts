import type { ComponentData } from "@elllphnt/elementa-base";
import type {
  ArrowFunction,
  FunctionDeclaration,
  FunctionExpression,
} from "ts-morph";
import { Node } from "ts-morph";
import { isComponentNode } from "../../../libs/ts/code.js";
import { parseComponentFunctionBody } from "./body/body.js";
import { parseComponentFunctionParams } from "./params.js";
import type { ParseComponentContext } from "./type.js";

export function parseComponentFunction({
  node,
  init,
  context,
}: {
  node: ArrowFunction | FunctionExpression | FunctionDeclaration;
  init?: ComponentData;
  context: ParseComponentContext;
}): ComponentData {
  const componentData: ComponentData = { ...init };
  parseComponentFunctionParams({ node, componentData });
  parseComponentFunctionBody({ node, componentData, context });
  return componentData;
}

export function parseComponentNode({
  node,
  init,
  context,
}: {
  node: Node;
  init?: ComponentData;
  context: ParseComponentContext;
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
        return parseComponentNode({
          node: expression,
          init,
          context,
        });
      } else {
        throw Error(`Unexpected expression in memo ${expression.getText()}`);
      }
    } else {
      throw Error(`Unexpected CallExpression as component ${calleeName}(...)`);
    }
  } else if (
    Node.isArrowFunction(node) ||
    Node.isFunctionExpression(node) ||
    Node.isFunctionDeclaration(node)
  ) {
    return parseComponentFunction({
      node,
      init,
      context,
    });
  } else {
    throw Error(`Unexpected node type for component: ${node.getKindName()}`);
  }
}
