import { isExpression, isStaticReference } from "@elllphnt/elementa-base";
import { TranspilerContext, TranspilerResult } from "../types/transpiler.js";

export function transpileDynamic(
  data: any,
  context: TranspilerContext
): TranspilerResult {
  if (isStaticReference(data)) {
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
