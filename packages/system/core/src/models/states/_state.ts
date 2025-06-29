import { RecordState } from "@elllphnt/elementa-utils";
import { Component } from "../component/_.js";
import { HookState } from "./hook.js";
import { InlineState } from "./inline.js";
import { ValueState } from "./value.js";

export type State = ValueState | HookState | InlineState;

export function createState({
  state,
  component,
}: {
  state: RecordState<any>;
  component: Component;
}): State {
  const type = state.entry("type");
  switch (type) {
    case "value":
      return new ValueState({ state, component });
    case "hook":
      return new HookState({ state, component });
    case "inline":
      return new InlineState({ state, component });
    default:
      throw new Error(`Unknown state type: ${type}`);
  }
}
