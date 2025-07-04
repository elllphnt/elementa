import type { HookState, InlineState, State } from "@elllphnt/elementa-models";
import type { Runtime } from "../../runtime/runtime.js";
import type { Instance } from "../instance.js";
import { HookStateInstance } from "./hook.js";
import { InlineStateInstance } from "./inline.js";
import { ValueStateInstance } from "./value.js";

export type StateInstance =
  | ValueStateInstance
  | HookStateInstance
  | InlineStateInstance;

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
    case "inline":
      return new InlineStateInstance({
        model: state as InlineState,
        runtime,
        parent,
      });
    default:
      throw new Error(`Unsupported state type: ${(state as any).type}`);
  }
}
