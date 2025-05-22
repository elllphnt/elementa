import { HookStateData } from "@elllphnt/elementa-base";
import { TranspilerDiagnosticLevel } from "~/types/diagnostic.js";
import { TranspilerContext, TranspilerResult } from "../../types/transpiler.js";
import { transpileDynamic } from "../dynamic.js";

export function transpileHookState(
  data: HookStateData,
  context: TranspilerContext
): TranspilerResult {
  if (!data.hookUrl) {
    context.addDiagnostic?.({
      level: TranspilerDiagnosticLevel.Warning,
      message: "No hook URL provided for hook state",
      data,
    });

    return {
      generate: () => `/* Missing hook state: ${data.name} */`,
    };
  }

  const hook = context.useModule({
    url: data.hookUrl,
    name: { capitalize: true },
  });

  const args = (data.args ?? []).map((arg) => transpileDynamic(arg, context));

  return {
    generate: (env) => {
      const hookName = env.getModuleName(hook.key);
      const argList = args.map((a) => a.generate(env)).join(", ");
      return `const ${data.name} = ${hookName}(${argList});`;
    },
  };
}
