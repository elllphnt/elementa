import * as t from "@babel/types";
import { ComponentElementData } from "@elllphnt/elementa-base";
import { CreateFragment } from "./_types.js";
import { GetStylesheet, parseBaseElementNode } from "./base_element.js";
import { extractElementsFromNode } from "./element.js";

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
    })
  );

  return {
    __componentElement: {
      ...base,
      url: {
        __dependency: name,
      } as any,
      content,
      tag: undefined,
      type: undefined,
    },
  } as any;
}
