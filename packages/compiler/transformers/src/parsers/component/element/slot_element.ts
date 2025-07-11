import * as t from "@babel/types";
import type { ElementData, SlotElementData } from "@elllphnt/elementa-base";
import type { CreateFragment } from "./_types.js";
import type { GetStylesheet } from "./base_element.js";
import { parseBaseElementNode } from "./base_element.js";

export function parseSlotElementNode({
  node,
  getStylesheet,
  createFragment,
}: {
  node: t.JSXElement;
  getStylesheet: GetStylesheet;
  createFragment: CreateFragment;
}): SlotElementData {
  const base = parseBaseElementNode({
    type: "slot",
    node,
    getStylesheet,
  });

  // Extract children as placeholder content
  const placeholder: ElementData[] = [];
  node.children.forEach((child) => {
    if (t.isJSXElement(child) || t.isJSXFragment(child)) {
      const parsed = extractElementsFromNode({
        node: child as t.Node,
        getStylesheet,
        createFragment,
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
