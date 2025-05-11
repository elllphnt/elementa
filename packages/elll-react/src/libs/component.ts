import {
  ComponentData,
  entityTypes,
  OverflowValue,
} from "@elllphnt/elll-element";
import { Dependency } from "../types/dependency.js";
import { TranspilerReference } from "../types/reference.js";
import { TranspilerResult } from "../types/transpiler.js";
import { createTranspilerContext } from "./_context.js";
import { transpileFragment } from "./fragment.js";
import { transpileState } from "./states/state.js";

export function transpileComponent(
  data: ComponentData,
  options?: {
    viewport?: {
      overflow: OverflowValue;
    };
  },
): TranspilerResult & {
  dependencies: Dependency[];
  references: TranspilerReference[];
} {
  const context = createTranspilerContext();

  const template = transpileFragment(
    {
      type: entityTypes.fragment,
      ...data.template,
      _id: "template",
    },
    context,
    {
      viewport: options?.viewport,
      naked: true,
    },
  );
  const states = data.states?.map((state) => {
    return transpileState(state, context);
  });

  return {
    generate: (env) => {
      const fragmentCode = template.generate(env);
      const stateCodes = states?.map((state) => state.generate(env)) ?? [];
      return [
        `(props)=>{`,
        ...stateCodes,
        ``,
        `return (${fragmentCode})`,
        `}`,
      ].join("\n");
    },
    dependencies: context.getDependencies(),
    references: context.getReferences(),
  };
}
