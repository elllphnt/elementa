import { FragmentData } from "@elllphnt/elementa-base";
import { TranspilerContext, TranspilerResult } from "../types/transpiler.js";
import { transpileElement } from "./elements/element.js";
import { transpileProvider } from "./providers/provider.js";

export function transpileFragment(
  data: FragmentData,
  context: TranspilerContext
): TranspilerResult {
  const content =
    data.content?.map((data) => transpileElement(data, context)) ?? [];

  const providers =
    data.providers?.map((provider) => transpileProvider(provider, context)) ??
    [];

  return {
    generate: (env) => {
      // 1. Generate JSX for inner content
      let contentCode: string;
      if (content.length === 0) {
        contentCode = "<></>";
      } else if (content.length === 1) {
        contentCode = content[0].generate(env);
      } else {
        const codes = content.map((c) => c.generate(env));
        contentCode = ["<>", ...codes, "</>"].join("\n");
      }

      // 2. Wrap in providers (from inside-out)
      for (let i = providers.length - 1; i >= 0; i--) {
        contentCode = providers[i].generate(env, [
          {
            generate: () => contentCode,
          },
        ]);
      }

      // 3. Return raw JSX
      return contentCode;
    },
  };
}
