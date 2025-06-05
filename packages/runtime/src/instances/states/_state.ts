import { HookState, State } from "@elllphnt/elementa-models";
import { Runtime } from "../../runtime/runtime.js";
import { Instance } from "../instance.js";
import { HookStateInstance } from "./hook.js";
import { ValueStateInstance } from "./value.js";

export type StateInstance = ValueStateInstance | HookStateInstance;

export function createStateInstance({
  state,
  runtime,
  parent,
}: {
  state: State;
  runtime: Runtime;
  parent?: Instance;
}): StateInstance {
  switch (state.type) {
    case "value":
      return new ValueStateInstance({
        model: state,
        runtime,
        parent,
      });
    case "hook":
      return new HookStateInstance({
        model: state as HookState,
        runtime,
        parent,
      });
    default:
      throw new Error(`Unsupported state type: ${(state as any).type}`);
  }
}
