import type * as t from "@babel/types";
import type { ComponentElementData } from "@elllphnt/elementa-base";
import type { CreateFragment } from "./_types.js";
import type { GetStylesheet } from "./base_element.js";
import { parseBaseElementNode } from "./base_element.js";

export function parseComponentElementNode({
  name,
  node,
  getStylesheet,
  createFragment,
}: {
  name: string;
  node: t.JSXElement;
  getStylesheet: GetStylesheet;
  createFragment: CreateFragment;
}): ComponentElementData {
  const base = parseBaseElementNode({
    type: "component",
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
    componentUrl: {
      __dependency: name,
    } as any,
    content,
    tag: undefined,
  };
}
