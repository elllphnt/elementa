import type { ContainerElementData } from "@elllphnt/elementa-base";
import type { JsxElement } from "ts-morph";
import { Node } from "ts-morph";
import { parseBaseElementNode } from "./base/base_element.js";
import { parseElementsFromNode } from "./element.js";
import type {
  ElementAttributeEntry,
  ParseElementContext,
} from "./utils/types.js";

export function parseContainerElementNode({
  node,
  context,
}: {
  node: JsxElement;
  context: ParseElementContext;
}): ContainerElementData {
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

  const base = parseBaseElementNode({
    type: "container",
    tag,
    attributes,
    context,
  });

  // Extract children
  const children = node.getJsxChildren();
  const content = children.flatMap((child) => {
    if (
      Node.isJsxElement(child) ||
      Node.isJsxFragment(child) ||
      Node.isJsxSelfClosingElement(child)
    ) {
      return parseElementsFromNode({
        node: child,
        context,
      });
    }
    return [];
  });

  return {
    ...base,
    content,
  };
}
