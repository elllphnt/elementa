import { ComponentData } from "@elllphnt/elementa-base";
import { join } from "path";
import { TranspilerContext, TranspilerResult } from "../types/transpiler.js";
import { transpileFragment } from "./fragment.js";
import { transpileState } from "./states/state.js";

export function transpileComponent(
  data: ComponentData,
  context: TranspilerContext
): TranspilerResult {
  const template = transpileFragment(
    {
      ...data.template,
      id: "template",
    },
    context
  );

  const states = data.states?.map((state) => transpileState(state, context));
  const fragments =
    data.fragments?.map(
      (fragment) => [fragment.id, transpileFragment(fragment, context)] as const
    ) || [];

  return {
    generate: (env) => {
      const templateCode = template.generate(env);
      const stateCode = states?.map((s) => s.generate(env)) ?? [];
      const fragmentsCode = join(
        [
          `{`,
          ...fragments.map(([id, f]) => {
            const code = f.generate(env);
            return `  "${id}": (${code}),`;
          }),
          `}`,
        ].join("\n")
      );

      return [
        `(props) => {`,
        ...stateCode,
        `const __fills = props.__fills || {};`,
        `const __fragments = ${fragmentsCode};`,
        `return (${templateCode})`,
        `}`,
      ].join("\n");
    },
  };
}
