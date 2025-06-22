import { FragmentElementData } from "@elllphnt/elementa-base";
import { TranspilerContext, TranspilerResult } from "~/types/transpiler.js";
import { transpileDynamic } from "../dynamic.js";
import { TranspileElementOptions } from "./_base.js";

export function transpileFragmentElement(
  data: FragmentElementData,
  context: TranspilerContext
): TranspilerResult<[TranspileElementOptions]> {
  const fragmentId = data.fragmentId;
  const params = Object.entries(data.params || {}).map(([key, value]) => {
    return [key, transpileDynamic(value, context)] as const;
  });

  return {
    generate: (env) => {
      if (!fragmentId) {
        return `<></>`;
      }
      const paramsCode = params
        .map(([key, value]) => `${key}: ${value.generate(env)}`)
        .join(", ");

      const fragmentExpression = `fragments["${fragmentId}"]({${paramsCode}})`;

      return `<>{${fragmentExpression}}</>`;
    },
  };
}
