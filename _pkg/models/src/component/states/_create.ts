import { StateData } from "@elllphnt/elementa-base";
import * as y from "yjs";
import { Component } from "../component";
import { attachHookState } from "./hook";
import { State } from "./state";
import { attachValueState } from "./value";

export function createState(ymap: y.Map<any>, component: Component): State {
  const type = ymap.get("type") as StateData["type"];
  if (type === "value") {
    return attachValueState(ymap, component) as State;
  } else if (type === "hook") {
    return attachHookState(ymap, component) as State;
  } else {
    throw new Error(`Unknown state type: ${type}`);
  }
}
