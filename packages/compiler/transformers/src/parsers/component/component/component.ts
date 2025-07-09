import type { ComponentData } from "@elllphnt/elementa-base";
import type {
  ArrowFunction,
  FunctionDeclaration,
  FunctionExpression,
} from "ts-morph";
import { Node } from "ts-morph";
import { isComponentNode } from "../../../libs/ts/code.js";
import { standardizeComponentFunction } from "../standardize.js";
import { parseComponentFunctionBody } from "./body.js";
import { parseComponentFunctionParams } from "./params.js";

export function parseComponentFunction({
  node,
  init,
}: {
  node: ArrowFunction | FunctionExpression | FunctionDeclaration;
  init?: ComponentData;
}): ComponentData {
  standardizeComponentFunction(node);
  console.log("Parsing component function:", node.getText());

  const componentData: ComponentData = { ...init };
  parseComponentFunctionParams({ node, componentData });
  parseComponentFunctionBody({ node, componentData });
  return componentData;
}

export function parseComponentNode({
  node,
  init,
}: {
  node: Node;
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
        return parseComponentNode({
          node: expression,
          init,
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
    });
  } else {
    throw Error(`Unexpected node type for component: ${node.getKindName()}`);
  }
}
