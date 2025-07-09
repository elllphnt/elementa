import type { FragmentElementData } from "@elllphnt/elementa-base";
import type {
  TranspilerContext,
  TranspilerResult,
} from "~/types/transpiler.js";
import { transpileDynamic } from "../../dynamic.js";
import type { TranspileElementOptions } from "./_base.js";

export function transpileFragmentElement(
  data: FragmentElementData,
  context: TranspilerContext
): TranspilerResult<[TranspileElementOptions]> {
  const fragmentId = data.fragmentId;
  console.log({ params: data.params, fragmentId });
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
