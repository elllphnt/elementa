import { StateData } from "@elllphnt/elementa-base";
import * as y from "yjs";
import { Component } from "../component.js";
import { attachHookState } from "./hook.js";
import { State } from "./state.js";
import { attachValueState } from "./value.js";

export function createState(
  ymap: y.Map<any>,
  component: Component
): ymap is State {
  const type = ymap.get("type") as StateData["type"];
  if (type === "value") {
    return attachValueState(ymap, component);
  } else if (type === "hook") {
    return attachHookState(ymap, component);
  } else {
    throw new Error(`Unknown state type: ${type}`);
  }
}
