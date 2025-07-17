import type { ElementData, SlotElementData } from "@elllphnt/elementa-base";
import type { Identifier, JsxChild } from "ts-morph";
import { Node } from "ts-morph";
import { parseBaseElementNode } from "./base/base_element.js";
import { parseElementsFromNode } from "./element.js";
import type {
  ElementAttributeEntry,
  ParseElementContext,
} from "./utils/types.js";

export function parseSlotElementNode({
  tag: tagNode,
  attributes,
  children,
  context,
}: {
  tag: Identifier;
  attributes: ElementAttributeEntry[];
  children: JsxChild[];
  context: ParseElementContext;
}): SlotElementData {
  const tag = tagNode.getText();
  const base = parseBaseElementNode({
    type: "slot",
    tag,
    attributes,
    context,
  });

  // Extract children as placeholder content
  const placeholder: ElementData[] = [];
  children.forEach((child) => {
    if (
      Node.isJsxElement(child) ||
      Node.isJsxFragment(child) ||
      Node.isJsxSelfClosingElement(child)
    ) {
      const parsed = parseElementsFromNode({
        node: child,
        context,
      });
      parsed.forEach((el) => placeholder.push(el));
    }
  });

  return {
    ...base,
    mode: "fill",
    placeholder: placeholder.length ? placeholder : undefined,
  } as SlotElementData;
}
