import type { VectorElementData } from "@elllphnt/elementa-base";
import type { Identifier, JsxChild } from "ts-morph";
import { Node } from "ts-morph";
import { parseBaseElementNode } from "./base/base_element.js";
import type {
  ElementAttributeEntry,
  ParseElementContext,
} from "./utils/types.js";

export function parseVectorElementNode({
  tag: tagNode,
  attributes,
  children,
  context,
}: {
  tag: Identifier;
  attributes: ElementAttributeEntry[];
  children: JsxChild[];
  context: ParseElementContext;
}): VectorElementData {
  const tag = tagNode.getText();
  const base = parseBaseElementNode({
    type: "vector",
    tag,
    attributes,
    context,
  });

  // Parse vector-specific attributes
  let width: VectorElementData["width"];
  let height: VectorElementData["height"];
  let viewBox: VectorElementData["viewBox"];
  let preserveAspectRatio: VectorElementData["preserveAspectRatio"];
  let content: VectorElementData["content"];

  attributes.forEach((attr) => {
    if (Array.isArray(attr)) {
      const [name, value] = attr;
      switch (name) {
        case "width":
          if (value) {
            width = {
              __expression: value.getText(),
            };
          }
          break;
        case "height":
          if (value) {
            height = {
              __expression: value.getText(),
            };
          }
          break;
        case "viewBox":
          if (value && Node.isStringLiteral(value)) {
            viewBox = value.getLiteralValue();
          } else if (value) {
            viewBox = {
              __expression: value.getText(),
            };
          }
          break;
        case "preserveAspectRatio":
          if (value && Node.isStringLiteral(value)) {
            preserveAspectRatio = value.getLiteralValue();
          } else if (value) {
            preserveAspectRatio = {
              __expression: value.getText(),
            };
          }
          break;
      }
    }
  });

  // Parse children for SVG content
  if (children.length > 0) {
    // TODO: Implement proper SVG content parsing
    // For now, just create a simple text node for any text content
    content = children.map((child) => {
      if (Node.isJsxText(child)) {
        return {
          type: "text" as const,
          value: child.getLiteralText(),
        };
      }
      // For now, skip element children - would need recursive parsing
      return {
        type: "text" as const,
        value: "",
      };
    });
  }

  return {
    ...base,
    width,
    height,
    viewBox,
    preserveAspectRatio,
    content,
  } as VectorElementData;
}
