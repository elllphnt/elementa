import type {
  ResolvableOrEvaluable,
  TextElementData,
  TextMarkData,
} from "@elllphnt/elementa-base";
import type { Identifier, JsxChild } from "ts-morph";
import { parseBaseElementNode } from "./base/base_element.js";
import { extractTextFromNode } from "./utils/extract_text.js";
import type {
  ElementAttributeEntry,
  ParseElementContext,
} from "./utils/types.js";

export function parseTextElementNode({
  tag: tagNode,
  attributes,
  children,
  context,
}: {
  tag: Identifier;
  attributes: ElementAttributeEntry[];
  children: JsxChild[];
  context: ParseElementContext;
}): TextElementData {
  const tag = tagNode.getText();
  const base = parseBaseElementNode({
    type: "text",
    tag,
    attributes,
    context,
  });

  // Extract text from children
  const rawText = children
    .map((child) => extractTextFromNode(child))
    .join("")
    .trim();
  const textField: ResolvableOrEvaluable<string> = rawText;
  const marks: TextMarkData[] = [];

  return {
    ...base,
    text: textField,
    marks,
  };
}
