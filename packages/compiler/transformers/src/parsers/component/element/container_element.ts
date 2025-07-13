import type { ContainerElementData } from "@elllphnt/elementa-base";
import type { Identifier, JsxChild } from "ts-morph";
import { parseBaseElementNode } from "./base/base_element.js";
import { parseElementsFromNode } from "./element.js";
import type {
  ElementAttributeEntry,
  ParseElementContext,
} from "./utils/types.js";

export function parseContainerElementNode({
  tag: tagNode,
  attributes,
  children,
  context,
}: {
  tag: Identifier;
  attributes: ElementAttributeEntry[];
  children: JsxChild[];
  context: ParseElementContext;
}): ContainerElementData {
  const tag = tagNode.getText();
  const base = parseBaseElementNode({
    type: "container",
    tag,
    attributes,
    context,
  });

  // Extract children
  const content = children.flatMap((child) => {
    return parseElementsFromNode({
      node: child,
      context,
    });
  });

  return {
    ...base,
    content,
  };
}
