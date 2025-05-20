import { SlotElementData } from "@elllphnt/elementa-base";
import { TranspilerContext, TranspilerResult } from "~/types/transpiler.js";
import { transpileBaseElement, TranspileElementOptions } from "./_base.js";

export function transpileSlotElement(
  data: SlotElementData,
  context: TranspilerContext
): TranspilerResult<[TranspileElementOptions]> {
  const base = transpileBaseElement(data, context);
  const slotId = data.id;
  let content: TranspilerResult;

  if (data.mode === "outlet") {
    const outlet = context.useModule({
      url: "@elllphnt/elementa-routing",
      specifier: "Outlet",
      name: { capitalize: true },
    });
    content = {
      generate: (env) => {
        const outletName = env.getModuleName(outlet.key);
        return [`<${outletName} />`].join("\n");
      },
    };
  } else {
    content = {
      generate: () => {
        return [`{__fills["${slotId}"]?.content ?? null}`].join("\n");
      },
    };
  }

  return {
    generate: (env, upstream) => {
      return base.generate(env, {
        tag: upstream.tag ?? "div",
        children: [content],
        classNames: [
          {
            generate: () => `\`\${__fills["${slotId}"]?.className ?? ""}\``,
          },
        ],
      });
    },
  };
}
