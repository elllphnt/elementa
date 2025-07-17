import type { TextElementData } from "@elllphnt/elementa-base";
import { generateDynamic } from "../misc/dynamic.js";
import { generatorBaseElement } from "./base.js";

const expressionRegex = /\{\{([^}]*\}?[^}]*)\}\}/;

export function compileString(str: string): string {
  const result = str.replace(expressionRegex, (_, expression) => {
    return `{${expression}}`;
  });

  // clean up escaped brackets
  return result.replace(/\\{/g, "{'{'}").replace(/\\}/g, "{'}'}");
}

export function generatorTextElement(data: TextElementData): string {
  const compiledText = compileString(generateDynamic(data.text));
  const content = [`{${compiledText}}`];

  return generatorBaseElement({
    tag: "span",
    content,
    data,
  });
}
