import * as t from "@babel/types";
import { ElementData } from "@elllphnt/elementa-base";
import { GetStylesheet } from "./base_element.js";
import { genId } from "./element.js";

export function parseMemberExpressionElementNode({
  node,
  getStylesheet,
}: {
  node: t.JSXElement;
  getStylesheet: GetStylesheet;
}): ElementData {
  // TODO: Implement member expression parsing
  // (e.g., for components accessed like Namespace.Component)

  return {
    id: genId(),
    type: "component", // Default to component, could be different
    tag: undefined,
  } as ElementData;
}
