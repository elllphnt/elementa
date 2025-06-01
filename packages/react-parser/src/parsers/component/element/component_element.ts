import * as t from "@babel/types";
import { ComponentElementData } from "@elllphnt/elementa-base";
import { GetStylesheet, parseBaseElementNode } from "./base_element.js";

export function parseComponentElementNode({
  name,
  node,
  getStylesheet,
}: {
  name: string;
  node: t.JSXElement;
  getStylesheet: GetStylesheet;
}): ComponentElementData {
  const base = parseBaseElementNode({
    type: "component",
    node,
    getStylesheet,
  });
  return {
    ...base,
    componentUrl: {
      __dependency: name,
    } as any,
  };
}
