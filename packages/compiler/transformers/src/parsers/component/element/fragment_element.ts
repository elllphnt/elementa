import type * as t from "@babel/types";
import type { ElementData } from "@elllphnt/elementa-base";
import type { CreateFragment } from "./_types.js";
import type { GetStylesheet } from "./base/base_element.js";

export function parseFragmentElementNode({
  node,
  getStylesheet,
  createFragment,
}: {
  node: t.JSXFragment;
  getStylesheet: GetStylesheet;
  createFragment: CreateFragment;
}): ElementData[] {
  const results: ElementData[] = [];
  node.children.forEach((child) => {
    results.push(
      ...extractElementsFromNode({
        node: child as t.Node,
        getStylesheet,
        createFragment,
      }),
    );
  });
  return results;
}
