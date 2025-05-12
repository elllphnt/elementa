import { StateData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Component } from "../../../_interfaces/component/component.js";
import { State } from "../../../_interfaces/component/states/_state.js";
import { BaseStateModel } from "./_base.js";

// This is a legacy class that's now replaced by BaseStateModel
// Keep for backwards compatibility
export abstract class StateModel<T extends StateData>
  extends BaseStateModel<T>
  implements State
{
  constructor({ init, component }: { init: T; component: Component }) {
    super({ init, component });
  }

  abstract get data(): T;
  abstract get data$(): Observable<T>;
}
