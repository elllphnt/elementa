import { SlotElementData } from "@elllphnt/elementa-base";
import { TranspilerContext, TranspilerResult } from "build/index.js";
import { transpileBaseElement, TranspileElementOptions } from "./_base.js";

export function transpileSlotElement(
  data: SlotElementData,
  context: TranspilerContext
): TranspilerResult<[TranspileElementOptions]> {
  const base = transpileBaseElement(data, context);

  return {
    generate: (env, upstream) => {
      const slotId = data.id;

      const content: TranspilerResult = {
        generate: () => {
          return [
            `(() => {`,
            `  const fill = fills["${slotId}"];`,
            `  if (!fill) return null;`,
            `  return fill.content;`,
            `})()`,
          ].join("\n");
        },
      };

      return base.generate(env, {
        tag: upstream.tag ?? "div",
        children: [content],
        classNames: [
          {
            generate: () => `\`\${fills["${slotId}"]?.className ?? ""}\``,
          },
        ],
      });
    },
  };
}
