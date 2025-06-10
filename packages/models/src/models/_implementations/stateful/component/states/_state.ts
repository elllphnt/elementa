import { StateData } from "@elllphnt/elementa-base";
import { Component } from "../../../../_interfaces/component/component.js";
import { StatefulHookState } from "./hook.js";
import { StatefulValueState } from "./value.js";

export type StatefulState = StatefulValueState | StatefulHookState;

export function StatefulcreateState({
  init,
  component,
}: {
  init: StateData;
  component: Component;
}): StatefulState {
  switch (init.type) {
    case "value":
      return new StatefulValueState({ init, component });
    case "hook":
      return new StatefulHookState({ init, component });
    default:
      throw new Error(`Unknown state type: ${(init as any).type}`);
  }
}
