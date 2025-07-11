import type { JsxChild, JsxElement } from "ts-morph";
import { Node } from "ts-morph";

export function extractTextFromNode(node: JsxChild): string {
  if (Node.isJsxText(node)) {
    return node.getLiteralText();
  }
  if (Node.isJsxExpression(node)) {
    const inner = node.getExpression();
    if (inner && Node.isStringLiteral(inner)) {
      return inner.getLiteralValue();
    } else if (inner) {
      return `{{ ${inner.getText().trim()} }}`;
    }
    return "";
  }
  if (Node.isJsxElement(node)) {
    return extractInnerTextFromElementNode(node);
  }
  if (Node.isJsxFragment(node)) {
    let fragText = "";
    node.getJsxChildren().forEach((child) => {
      fragText += extractTextFromNode(child);
    });
    return fragText;
  }
  return "";
}

export function extractInnerTextFromElementNode(node: JsxElement): string {
  let result = "";
  node.getJsxChildren().forEach((child) => {
    result += extractTextFromNode(child);
  });
  return result;
}
