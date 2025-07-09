import type { StateData } from "@elllphnt/elementa-base";
import type {
  TranspilerContext,
  TranspilerResult,
} from "../types/transpiler.js";
import { transpileHookState } from "./hook.js";
import { transpileInlineState } from "./inline.js";
import { transpileValueState } from "./value.js";

export function transpileState(
  data: StateData,
  context: TranspilerContext
): TranspilerResult {
  switch (data.type) {
    case "value":
      return transpileValueState(data, context);
    case "hook":
      return transpileHookState(data, context);
    case "inline":
      return transpileInlineState(data, context);
    default:
      throw new Error(`Unsupported state type: ${(data as any).type}.`);
  }
}
