import { ValueStateData } from "@elllphnt/elementa-base";
import { combineLatestMerged } from "@elllphnt/elementa-utils";
import { Observable, of } from "rxjs";
import { Component } from "../../../_interfaces/component/component.js";
import { ValueState } from "../../../_interfaces/component/states/value.js";
import { StateModel } from "./state.js";

export class ValueStateModel
  extends StateModel<ValueStateData>
  implements ValueState
{
  constructor({
    init,
    component,
  }: {
    init: ValueStateData;
    component: Component;
  }) {
    super({ init, component });
  }

  // data getters
  get data(): ValueStateData {
    return {
      ...super._data,
      type: "value",
    };
  }

  get data$(): Observable<ValueStateData> {
    return combineLatestMerged([super._data$, of({ type: "value" as const })]);
  }

  get init(): any {
    return this._state.entry("init");
  }

  get init$(): Observable<any> {
    return this._state.entry$("init");
  }

  get tsType(): string | undefined {
    return this._state.entry("tsType");
  }

  get tsType$(): Observable<string | undefined> {
    return this._state.entry$("tsType");
  }
}
