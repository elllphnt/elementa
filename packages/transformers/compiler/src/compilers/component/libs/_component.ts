import type { ComponentData } from "@elllphnt/elementa-base";
import { join } from "path";
import type {
  TranspilerContext,
  TranspilerResult,
} from "../types/transpiler.js";
import { transpileElement } from "./elements/element.js";
import { transpileFragment } from "./fragment.js";
import { transpileState } from "./states/state.js";

export function transpileComponent(
  data: ComponentData,
  context: TranspilerContext
): TranspilerResult {
  const content =
    data.content?.map((content) => transpileElement(content, context)) ?? [];

  const states = data.states?.map((state) => transpileState(state, context));
  const fragments =
    data.fragments?.flatMap((fragment) => {
      const result = transpileFragment(fragment, context);
      const entries = [[fragment.id, result] as const];
      if (fragment.varName) {
        entries.push([fragment.varName, result] as const);
      }
      return entries;
    }) || [];

  return {
    generate: (env) => {
      let contentCode = `<></>`;
      if (content.length === 1) {
        contentCode = content[0].generate(env);
      } else if (content.length > 1) {
        contentCode = [
          `<>`,
          ...content.map((c) => c.generate(env)),
          `</>`,
        ].join("\n");
      }

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
        `const fills = props.__fills || {};`,
        `const fragments = ${fragmentsCode};`,
        ...stateCode,
        `return (${contentCode})`,
        `}`,
      ].join("\n");
    },
  };
}
