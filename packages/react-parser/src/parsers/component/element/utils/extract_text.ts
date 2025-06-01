import * as t from "@babel/types";
import { generateExpressionSource } from "./generate";

export function extractTextFromNode(node: t.Node): string {
  if (t.isJSXText(node)) {
    return node.value;
  }
  if (t.isJSXExpressionContainer(node)) {
    const inner = node.expression;
    if (t.isStringLiteral(inner)) {
      return inner.value;
    } else {
      return `{{ ${generateExpressionSource(inner).trim()} }}`;
    }
  }
  if (t.isJSXSpreadChild(node)) {
    const spreadExpr = node.expression;
    return `{{ ...${generateExpressionSource(spreadExpr).trim()} }}`;
  }
  if (t.isJSXElement(node)) {
    return extractInnerTextFromElementNode(node);
  }
  if (t.isJSXFragment(node)) {
    let fragText = "";
    node.children.forEach((child) => {
      fragText += extractTextFromNode(child as t.Node);
    });
    return fragText;
  }
  return "";
}

export function extractInnerTextFromElementNode(node: t.JSXElement): string {
  let result = "";
  node.children.forEach((child) => {
    result += extractTextFromNode(child as t.Node);
  });
  return result;
}
