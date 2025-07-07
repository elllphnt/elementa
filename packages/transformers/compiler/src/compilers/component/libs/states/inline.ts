import type { InlineStateData } from "@elllphnt/elementa-base";
import { TranspilerDiagnosticLevel } from "~/types/diagnostic.js";
import type { TranspilerContext, TranspilerResult } from "../../types/transpiler.js";

export function transpileInlineState(
  data: InlineStateData,
  context: TranspilerContext
): TranspilerResult {
  if (!data.script) {
    context.addDiagnostic?.({
      level: TranspilerDiagnosticLevel.Warning,
      message: "No script provided for inline state",
      data,
    });

    return {
      generate: () => `/* Missing inline state: ${data.name} */`,
    };
  }

  return {
    generate: () => {
      const expression = `(() => { ${data.script} })()`;
      return data.name
        ? `const ${data.name} = ${expression};`
        : `${expression};`;
    },
  };
}
