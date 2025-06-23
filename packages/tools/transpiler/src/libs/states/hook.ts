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
  });

  const argMode = data.argMode || "named";
  const args = Object.entries(data.args ?? {})
    .map(([key, arg]) => [key, transpileDynamic(arg, context)] as const)
    .sort((a, b) => a[0].localeCompare(b[0]));

  return {
    generate: (env) => {
      const hookName = env.getModuleName(hook.key);
      let expression: string;
      if (argMode === "positional") {
        const argList = args.map((a) => a[1].generate(env)).join(", ");
        expression = `${hookName}(${argList})`;
      } else {
        const argObject = args
          .map(([key, arg]) => `${key}: ${arg.generate(env)}`)
          .join(", ");
        expression = `${hookName}({ ${argObject} })`;
      }

      if (data.name) {
        return `const ${data.name} = ${expression};`;
      } else {
        return `${expression};`;
      }
    },
  };
}
