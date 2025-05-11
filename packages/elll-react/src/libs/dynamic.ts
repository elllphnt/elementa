import { isExpression, isReference } from "@elllphnt/elll-element";
import { TranspilerContext, TranspilerResult } from "../types/transpiler.js";

export function transpileDynamic(
  data: any,
  context: TranspilerContext,
): TranspilerResult {
  if (isReference(data)) {
    const ref = context.useReference(data);
    return {
      generate: (env) => {
        const value = env.getResolvedValue(ref.key);
        return JSON.stringify(value);
      },
    };
  } else if (isExpression(data)) {
    return {
      generate: () => {
        return data.__expression;
      },
    };
  } else {
    return {
      generate: () => {
        return JSON.stringify(data);
      },
    };
  }
}
