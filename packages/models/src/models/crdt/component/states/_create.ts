import { StateData } from "@elllphnt/elementa-base";
import * as y from "yjs";
import { Component } from "../../../_interfaces/component/component.js";
import { State } from "../../../_interfaces/component/states/state.js";
import { attachHookState } from "./hook.js";
import { attachValueState } from "./value.js";

export function createState(
  state: y.Map<any>,
  component: Component
): state is y.Map<any> & State {
  const type = state.get("type") as StateData["type"];
  if (type === "value") {
    return attachValueState(state, component);
  } else if (type === "hook") {
    return attachHookState(state, component);
  } else {
    throw new Error(`Unknown state type: ${type}`);
  }
}
