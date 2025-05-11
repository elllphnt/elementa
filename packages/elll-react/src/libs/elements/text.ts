import { TextElementData } from "@elllphnt/elll-element";
import { TranspilerContext, TranspilerResult } from "../../types/transpiler.js";
import { compileStylesheet } from "../style/style.js";

const expressionRegex = /\{\{([^}]*\}?[^}]*)\}\}/;

export function compileString(str: string): string {
  const result = str.replace(expressionRegex, (_, expression) => {
    return `{${expression}}`;
  });

  // clean up escaped brackets
  return result.replace(/\\{/g, "{'{'}").replace(/\\}/g, "{'}'}");
}

export function transpileTextElement(
  data: TextElementData,
  context: TranspilerContext,
): TranspilerResult {
  const classes = compileStylesheet(data.stylesheet ?? {});
  const classesCode = classes.join(" ");

  return {
    generate: (env) => {
      const propsCode = `className="${classesCode}"`;
      return [
        `<span ${propsCode} >`,
        compileString(data.text || ""),
        `</span>`,
      ].join("\n");
    },
  };
}
