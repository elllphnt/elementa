import { StateData } from "@elllphnt/elementa-base";
import { Component } from "../../../_interfaces/component/component.js";
import { BaseStateModel } from "./_base.js";
import { HookStateModel } from "./hook.js";
import { ValueStateModel } from "./value.js";

export function createStateModel({
  init,
  component,
}: {
  init: StateData;
  component: Component;
}): BaseStateModel<any> {
  switch (init.type) {
    case "value":
      return new ValueStateModel({ init, component });
    case "hook":
      return new HookStateModel({ init, component });
    default:
      throw new Error(`Unknown state type: ${(init as any).type}`);
  }
}
