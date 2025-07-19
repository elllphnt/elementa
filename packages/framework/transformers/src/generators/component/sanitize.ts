import type { JsxElement, JsxExpression, JsxFragment } from "ts-morph";
import { Node, SyntaxKind } from "ts-morph";

// Main sanitizer type
export type SanitizeNode<T extends Node> = (node: T) => Node;

// Inline JSX string literal child: <div>{"foo"}</div> -> <div>foo</div>
export const sanitizeJsxExpression: SanitizeNode<JsxExpression> = (node) => {
  const inner = node.getExpression();
  if (inner && Node.isStringLiteral(inner)) {
    const parent = node.getParent();
    if (Node.isJsxElement(parent) || Node.isJsxFragment(parent)) {
      return node.replaceWithText(inner.getLiteralText());
    } else if (Node.isJsxAttribute(parent)) {
      return node.replaceWithText(`"${inner.getLiteralText()}"`);
    }
  }
  return node;
};

// <span>foo</span> (no props, only text) => "foo"
export const sanitizeSpanElement: SanitizeNode<JsxElement> = (node) => {
  const opening = node.getOpeningElement();
  const tagName = opening.getTagNameNode().getText();
  const attrs = opening.getAttributes();
  const children = node
    .getJsxChildren()
    .filter(
      (ch) => !ch.isKind(SyntaxKind.JsxText) || ch.getText().trim() !== "",
    );
  if (tagName === "span" && attrs.length === 0 && children.length === 1) {
    const child = children[0];
    if (Node.isJsxText(child)) {
      const parent = node.getParent();
      if (Node.isJsxElement(parent) || Node.isJsxFragment(parent)) {
        return node.replaceWithText(child.getText());
      } else {
        return node.replaceWithText(`"${child.getText()}"`);
      }
    }
  }
  return node;
};

// <>...</>
export const sanitizeFragment: SanitizeNode<JsxFragment> = (node) => {
  const children = node
    .getJsxChildren()
    .filter(
      (ch) => !ch.isKind(SyntaxKind.JsxText) || ch.getText().trim() !== "",
    );
  if (children.length === 1) {
    const parent = node.getParent();
    const child = children[0];
    if (Node.isJsxElement(parent) || Node.isJsxFragment(parent)) {
      return node.replaceWithText(child.getText());
    } else {
      if (Node.isJsxExpression(child)) {
        const expression = child.getExpression();
        if (expression) {
          return node.replaceWithText(expression.getText());
        }
      } else {
        return node.replaceWithText(child.getText());
      }
    }
  }
  return node;
};

// Recursively sanitize a node and its children.
// This version always works with possibly-updated nodes (for replacements).
export function sanitizeNode(node: Node): Node {
  for (const child of node.getChildren()) {
    sanitizeNode(child);
  }

  let nextNode = node;

  if (Node.isJsxExpression(nextNode)) {
    nextNode = sanitizeJsxExpression(nextNode);
  }
  if (Node.isJsxElement(nextNode)) {
    nextNode = sanitizeSpanElement(nextNode);
  }
  if (Node.isJsxFragment(nextNode)) {
    nextNode = sanitizeFragment(nextNode);
  }

  return nextNode;
}
