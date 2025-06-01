import * as t from "@babel/types";
import { ElementData } from "@elllphnt/elementa-base";
import { CreateFragment } from "./_types.js";
import { GetStylesheet } from "./base_element.js";
import { extractElementsFromNode } from "./element.js";

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
      })
    );
  });
  return results;
}
