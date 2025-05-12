import { StateData } from "@elllphnt/elementa-base";
import { Component } from "../../../_interfaces/component/component.js";
import { HookStateModel } from "./hook.js";
import { ValueStateModel } from "./value.js";

export type StateModel = ValueStateModel | HookStateModel;

export function createStateModel({
  init,
  component,
}: {
  init: StateData;
  component: Component;
}): StateModel {
  switch (init.type) {
    case "value":
      return new ValueStateModel({ init, component });
    case "hook":
      return new HookStateModel({ init, component });
    default:
      throw new Error(`Unknown state type: ${(init as any).type}`);
  }
}
