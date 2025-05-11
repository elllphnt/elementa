import {
  entityTypes,
  StateData,
  switchEntityType,
} from "@elllphnt/elll-element";
import { TranspilerContext, TranspilerResult } from "../../types/transpiler.js";
import { transpileModuleState } from "./module.js";
import { transpileValueState } from "./value.js";

export function transpileState(
  data: StateData,
  context: TranspilerContext,
): TranspilerResult {
  return switchEntityType<TranspilerResult>(
    data.type,
    {
      [entityTypes.states.value]: () => {
        return transpileValueState(data, context);
      },
      [entityTypes.states.module]: () => {
        return transpileModuleState(data, context);
      },
    },
    () => {
      console.warn(`Unknown state type: ${data.type}`);
      return {
        generate: () => `<>{/* Unknown state type: ${data.type} */}</>`,
      };
    },
  );
}
