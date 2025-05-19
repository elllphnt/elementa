import { ComponentData } from "@elllphnt/elementa-base";
import { Dependency } from "../types/dependency.js";
import { TranspilerReference } from "../types/reference.js";
import { TranspilerResult } from "../types/transpiler.js";
import { createTranspilerContext } from "./_context.js";
import { transpileFragment } from "./fragment.js";
import { transpileState } from "./states/state.js";

export function transpileComponent(data: ComponentData): TranspilerResult & {
  dependencies: Dependency[];
  references: TranspilerReference[];
} {
  const context = createTranspilerContext();

  const template = transpileFragment(
    {
      ...data.template,
      id: "template",
    },
    context
  );

  const states = data.states?.map((state) => transpileState(state, context));

  return {
    generate: (env) => {
      const fragmentFn = template.generate(env); // ($) => JSX
      const stateCode = states?.map((s) => s.generate(env)) ?? [];

      return [
        `(props) => {`,
        ...stateCode,
        `const template = ${fragmentFn};`,
        `const fills = props.__fills || {};`,
        `return template({});`,
        `}`,
      ].join("\n");
    },
    dependencies: context.getDependencies(),
    references: context.getReferences(),
  };
}
