import type { Evaluable } from "@elllphnt/elementa-base";
import type {
  TranspilerContext,
  TranspilerResult,
} from "~/types/transpiler.js";
import { transpileDynamic } from "../../../dynamic.js";
import type { TranspileElementOptions } from "../_base.js";

export function applyConditionToTranspiledElement(
  condition: Evaluable<boolean>,
  element: TranspilerResult<[TranspileElementOptions]>,
  context: TranspilerContext
): TranspilerResult<[TranspileElementOptions]> {
  const conditionExpr = transpileDynamic(condition, context);

  return {
    generate: (env, upstream) => {
      const inner = element.generate(env, upstream);
      const test = conditionExpr.generate(env);
      return `{(${test}) ? (${inner}) : null}`;
    },
  };
}
