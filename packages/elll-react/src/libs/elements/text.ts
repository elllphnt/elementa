import { TextElementData } from "@elllphnt/elementa-base";
import { TranspilerContext, TranspilerResult } from "../../types/transpiler.js";
import { transpileDynamic } from "../dynamic.js";
import { transpileBaseElement, TranspileElementOptions } from "./_base.js";

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
  context: TranspilerContext
): TranspilerResult<[TranspileElementOptions]> {
  const base = transpileBaseElement(data, context);
  const text = transpileDynamic(data.text, context);

  return {
    generate: (env, upstream) => {
      const compiledText = compileString(text.generate(env));

      return base.generate(env, {
        ...upstream,
        tag: upstream.tag ?? "span",
        children: [
          {
            generate: () => compiledText,
          },
        ],
      });
    },
  };
}
