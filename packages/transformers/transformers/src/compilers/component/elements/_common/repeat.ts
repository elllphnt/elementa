import type { ElementRepeatData } from "@elllphnt/elementa-base";
import { TranspilerDiagnosticLevel } from "~/types/diagnostic.js";
import type {
  TranspilerContext,
  TranspilerResult,
} from "~/types/transpiler.js";
import { transpileDynamic } from "../../libs/dynamic.js";
import type { TranspileElementOptions } from "../_base.js";

export function applyRepeatToTranspiledElement(
  repeat: ElementRepeatData,
  element: TranspilerResult<[TranspileElementOptions]>,
  context: TranspilerContext
): TranspilerResult<[TranspileElementOptions]> {
  const mode = repeat.mode ?? "dynamic";

  return {
    generate: (env, upstream) => {
      const repeated = element.generate(env, upstream);

      if (mode === "fixed") {
        if (repeat.count === undefined) {
          context.addDiagnostic?.({
            level: TranspilerDiagnosticLevel.Warning,
            message: "Fixed repeat mode requires a 'count' value",
            data: repeat,
          });
          return repeated;
        }

        const count = transpileDynamic(repeat.count, context).generate(env);
        return `{Array.from({ length: ${count} }).map((_, index) => (${repeated}))}`;
      }

      if (repeat.dataset === undefined) {
        context.addDiagnostic?.({
          level: TranspilerDiagnosticLevel.Warning,
          message: "Dynamic repeat mode requires a 'dataset' value",
          data: repeat,
        });
        return repeated;
      }

      const dataset = transpileDynamic(repeat.dataset, context).generate(env);
      return `{(${dataset} ?? []).map((item, index) => (${repeated}))}`;
    },
  };
}
