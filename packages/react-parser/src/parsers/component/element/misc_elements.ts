import * as t from "@babel/types";
import { ElementData } from "@elllphnt/elementa-base";
import { GetStylesheet } from "./base_element.js";
import { generate } from "./utils/generate.js";
import { genId } from "../utils.js";

export function parseExpressionContainerNode({
  node,
}: {
  node: t.JSXExpressionContainer;
  getStylesheet: GetStylesheet;
}): ElementData {
  return {
    id: genId(),
    type: "text",
    text: `Expression Container not implemented yet: ${generate(node)}`,
  };
}
