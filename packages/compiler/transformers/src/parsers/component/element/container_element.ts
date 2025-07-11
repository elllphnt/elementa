import type * as t from "@babel/types";
import type { ContainerElementData } from "@elllphnt/elementa-base";
import type { CreateFragment } from "./_types.js";
import type { GetStylesheet } from "./base_element.js";
import { parseBaseElementNode } from "./base_element.js";

export function parseContainerElementNode({
  node,
  getStylesheet,
  createFragment,
}: {
  node: t.JSXElement;
  getStylesheet: GetStylesheet;
  createFragment: CreateFragment;
}): ContainerElementData {
  const base = parseBaseElementNode({
    type: "container",
    node,
    getStylesheet,
  });

  // Extract children
  const content = node.children.flatMap((child) =>
    extractElementsFromNode({
      node: child as t.Node,
      getStylesheet,
      createFragment,
    }),
  );

  return {
    ...base,
    content,
  };
}
