import { FragmentData, OverflowValue } from "@elllphnt/elll-element";
import { TranspilerContext, TranspilerResult } from "../types/transpiler.js";
import { transpileElement } from "./elements/element.js";
import { transpilePageElement } from "./elements/page.js";

export function transpileFragment(
  data: FragmentData,
  context: TranspilerContext,
  options?: {
    viewport?: {
      overflow: OverflowValue;
    };
    naked?: boolean;
  },
): TranspilerResult {
  let content: TranspilerResult[];

  if (options?.viewport) {
    content = [
      transpilePageElement(
        {
          ...data.page,
          type: "page",
          content: data.content,
          viewportOverflow: options.viewport.overflow,
        },
        context,
      ),
    ];
  } else {
    content =
      data.content?.map((data) => transpileElement(data, context)) ?? [];
  }

  return {
    generate: (env) => {
      let contentCode: string;

      if (!content.length) {
        contentCode = "<></>";
      } else if (content.length === 1) {
        contentCode = content[0].generate(env);
      } else {
        const codes = content.map((c) => c.generate(env));
        contentCode = [`<>`, ...codes, `</>`].join("\n");
      }

      return options?.naked ? contentCode : `($ : {} ={})=>(${contentCode})`;
    },
  };
}
