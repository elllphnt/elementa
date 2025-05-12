import { StateData } from "@elllphnt/elementa-base";
import { assert } from "@elllphnt/elementa-utils";
import { Component } from "../../../_interfaces/component/component.js";
import { HookStateModel } from "./hook.js";
import { StateModel } from "./state.js";
import { ValueStateModel } from "./value.js";

export function createStateModel({
  init,
  component,
}: {
  init: StateData;
  component: Component;
}): StateModel<any> {
  switch (init.type) {
    case "value":
      return new ValueStateModel({ init, component });
    case "hook":
      return new HookStateModel({ init, component });
    default:
      assert(false, `Unknown state type: ${(init as any).type}`);
  }
}
