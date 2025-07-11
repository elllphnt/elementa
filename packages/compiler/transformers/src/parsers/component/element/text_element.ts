import type * as t from "@babel/types";
import type {
  ResolvableOrEvaluable,
  TextElementData,
  TextMarkData,
} from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { JsxChild } from "ts-morph";
import type { ElementAttributeEntry } from "./_types.js";
import type { GetStylesheet } from "./base_element.js";
import { parseBaseElementNode } from "./base_element.js";
import type { ParseElementContext } from "./element.js";
import { extractInnerTextFromElementNode } from "./utils/extract_text.js";

export function parseTextElementNode({
  tag,
  attributes,
  children,
  context,
}: {
  tag: string;
  attributes: ElementAttributeEntry[];
  children: JsxChild[];
  context: ParseElementContext;
}): TextElementData {
  const base = parseBaseElementNode({
    type: "text",
    tag,
    attributes,
    children,
    context,
  });
  const rawText = extractInnerTextFromElementNode(node).trim();
  const textField: ResolvableOrEvaluable<string> = rawText;
  const marks: TextMarkData[] = [];
  return {
    ...base,
    text: textField,
    marks,
  };
}

export function parseJSXTextNode({
  node,
}: {
  node: t.JSXText;
  getStylesheet: GetStylesheet;
}): TextElementData {
  const raw = node.value.trim();
  const textField: ResolvableOrEvaluable<string> = raw;
  return {
    id: genId(),
    type: "text",
    text: textField,
  };
}
