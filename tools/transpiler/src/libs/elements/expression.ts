/* eslint-disable @typescript-eslint/no-unused-vars */
import { ExpressionElementData } from "@elllphnt/elementa-base";
import { TranspilerContext, TranspilerResult } from "~/types/transpiler.js";
import { TranspileElementOptions } from "./_base.js";

export function transpileExpressionElement(
  data: ExpressionElementData,
  context: TranspilerContext
): TranspilerResult<[TranspileElementOptions]> {
  const expression = data.expression;
  return {
    generate: () => {
      return expression ? `</>{${expression}}</>` : `<></>`;
    },
  };
}
