import type { ElementData, ElementRepeatData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { JsxChild } from "ts-morph";
import { parseExpression } from "../misc/expression.js";
import { parseElementsFromNode } from "./element.js";
import type {
  ElementAttributeEntry,
  ParseElementContext,
} from "./utils/types.js";

export function parseRepeatElementNode({
  attributes,
  children,
  context,
}: {
  attributes: ElementAttributeEntry[];
  children: JsxChild[];
  context: ParseElementContext;
}): ElementData | undefined {
  const repeat: ElementRepeatData = {};

  attributes.forEach((attr) => {
    if (Array.isArray(attr)) {
      const [attrName, value] = attr;
      if (attrName === "count" && value) {
        repeat.count = parseExpression(value, context.scope);
      } else if (attrName === "as" && value) {
        repeat.alias = parseExpression(value, context.scope);
      } else if (attrName === "data" && value) {
        repeat.dataset = parseExpression(value, context.scope);
      } else if (attrName === "index" && value) {
        repeat.indexAlias = parseExpression(value, context.scope);
      } else if (attrName === "mode" && value) {
        repeat.mode = parseExpression(value, context.scope);
      }
    }
  });

  const content = children.flatMap((child) => {
    return parseElementsFromNode({
      node: child,
      context,
    });
  });

  if (content.length === 1) {
    return {
      ...content[0],
      repeat,
    };
  } else {
    const fragment = context.createFragment({ content });
    return {
      id: genId(),
      type: "fragment",
      fragmentId: fragment.id,
      repeat,
    };
  }
}
