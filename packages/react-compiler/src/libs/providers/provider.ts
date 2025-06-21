import { ProviderData } from "@elllphnt/elementa-base";
import { TranspilerContext, TranspilerResult } from "../../types/transpiler.js";
import { transpileContextProvider } from "./context.js";

export function transpileProvider(
  data: ProviderData,
  context: TranspilerContext
): TranspilerResult<[children: TranspilerResult[]]> {
  switch (data.type) {
    case "context":
      return transpileContextProvider(data, context);
    default:
      throw new Error(`Unsupported provider type: ${(data as any).type}.`);
  }
}
