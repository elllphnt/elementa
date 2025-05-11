import { HookState, State, ValueState } from "@elllphnt/elementa-models";
import { Runtime } from "../../runtime/runtime.js";
import { Instance } from "../instance.js";
import {
  HookStateInstance,
  StateInstance,
  ValueStateInstance,
} from "../states/_.js";

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
        state: state as ValueState,
        runtime,
        parent,
      });
    case "hook":
      return new HookStateInstance({
        state: state as HookState,
        runtime,
        parent,
      });
    default:
      throw new Error(`Unsupported state type: ${state.type}`);
  }
}
