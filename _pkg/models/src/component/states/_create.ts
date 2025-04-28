import { StateData } from "@elllphnt/elementa-base";
import * as y from "yjs";
import { Component } from "../component";
import { HookState } from "./hook";
import { State } from "./state";
import { ValueState } from "./value";

export function createState(ymap: y.Map<any>, component: Component): State {
  const type = ymap.get("type") as StateData["type"];
  if (type === "value") {
    return new ValueState(ymap, component);
  } else if (type === "hook") {
    return new HookState(ymap, component);
  } else {
    throw new Error(`Unknown state type: ${type}`);
  }
}
