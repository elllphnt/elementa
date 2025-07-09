import type { ValueStateData } from "@elllphnt/elementa-base";
import { TranspilerDiagnosticLevel } from "~/types/diagnostic.js";
import { transpileDynamic } from "../dynamic.js";
import type {
  TranspilerContext,
  TranspilerResult,
} from "../types/transpiler.js";

export function transpileValueState(
  data: ValueStateData,
  context: TranspilerContext
): TranspilerResult {
  const name = data.name;

  if (!name) {
    context.addDiagnostic?.({
      level: TranspilerDiagnosticLevel.Warning,
      message: "Value state is missing a name",
      data,
    });

    return {
      generate: () => `/* Missing state name */`,
    };
  }

  const elllDependency = context.useModule({
    url: "elll",
    specifier: "useValueState",
    name: { base: "useValueState" },
  });

  const initValue = data.init
    ? transpileDynamic(data.init, context)
    : undefined;

  return {
    generate: (env) => {
      const hookName = env.getModuleName(elllDependency.key);
      const initArg = initValue ? `(${initValue.generate(env)})` : `()`;
      return `const ${name} = ${hookName}${initArg};`;
    },
  };
}
