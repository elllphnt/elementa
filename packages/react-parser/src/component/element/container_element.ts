import * as t from "@babel/types";
import { ContainerElementData } from "@elllphnt/elementa-base";
import { CreateFragment } from "./_types.js";
import { GetStylesheet, parseBaseElementNode } from "./base_element.js";
import { extractElementsFromNode } from "./element.js";

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
    })
  );

  return {
    ...base,
    content,
  };
}
