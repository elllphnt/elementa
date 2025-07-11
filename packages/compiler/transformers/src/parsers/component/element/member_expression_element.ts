import type { ElementData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { JsxElement, JsxTagNameExpression } from "ts-morph";
import { Node } from "ts-morph";
import { parseBaseElementNode } from "./base/base_element.js";
import type {
  ElementAttributeEntry,
  ParseElementContext,
} from "./utils/types.js";

function memberExpressionToString(expr: JsxTagNameExpression): string {
  if (Node.isPropertyAccessExpression(expr)) {
    const object = expr.getExpression();
    const property = expr.getName();
    const objectName = Node.isIdentifier(object)
      ? object.getText()
      : memberExpressionToString(object as JsxTagNameExpression);
    return `${objectName}.${property}`;
  } else if (Node.isIdentifier(expr)) {
    return expr.getText();
  }
  return expr.getText();
}

export function parseMemberExpressionElementNode({
  node,
  context,
}: {
  node: JsxElement;
  context: ParseElementContext;
}): ElementData {
  const tagNameNode = node.getOpeningElement().getTagNameNode();
  const tag = tagNameNode.getText();
  const attributes: ElementAttributeEntry[] = node
    .getOpeningElement()
    .getAttributes()
    .map((attr) => {
      if (Node.isJsxAttribute(attr)) {
        const nameNode = attr.getNameNode();
        if (Node.isIdentifier(nameNode)) {
          const value = attr.getInitializer();
          return [nameNode.getText(), value] as const;
        } else {
          throw new Error(
            `Expected identifier for attribute name, got ${nameNode.getKindName()}`,
          );
        }
      } else {
        return attr.getExpression();
      }
    });

  // First, parse base element properties (id, attributes, styles, children, etc.)
  const base = parseBaseElementNode({
    type: "component",
    tag,
    attributes,
    context,
  });

  // Determine the full tag name from a JSXMemberExpression
  let fullTagName: string | undefined;
  if (
    Node.isPropertyAccessExpression(tagNameNode) ||
    Node.isIdentifier(tagNameNode)
  ) {
    fullTagName = memberExpressionToString(tagNameNode);
  } else {
    fullTagName = tagNameNode.getText();
  }

  return {
    ...base,
    id: genId(),
    type: "component",
    tag: fullTagName,
  };
}
