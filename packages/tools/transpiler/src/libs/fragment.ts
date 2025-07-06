import type { FragmentData } from "@elllphnt/elementa-base";
import type { TranspilerContext, TranspilerResult } from "../types/transpiler.js";
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

  const params = data.params ?? [];

  return {
    generate: (env) => {
      // Generate inner JSX
      let contentCode: string;
      if (content.length === 0) {
        contentCode = "<></>";
      } else if (content.length === 1) {
        contentCode = content[0].generate(env);
      } else {
        const codes = content.map((c) => c.generate(env));
        contentCode = ["<>", ...codes, "</>"].join("\n");
      }

      // Wrap in providers (inside-out)
      for (let i = providers.length - 1; i >= 0; i--) {
        contentCode = providers[i].generate(env, [
          {
            generate: () => contentCode,
          },
        ]);
      }

      // Build function params
      let paramDecl = "";
      if (params.length > 0) {
        const props: string[] = params.map((param) => {
          return param.name;
        });
        paramDecl = `{ ${props.join(", ")} }`;
      }

      return `(${paramDecl}) => {\n  return (\n${indent(contentCode)}\n  );\n}`;
    },
  };
}

function indent(code: string, spaces = 4): string {
  const pad = " ".repeat(spaces);
  return code
    .split("\n")
    .map((line) => pad + line)
    .join("\n");
}
