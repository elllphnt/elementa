import { ValueStateData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Component } from "../../../_interfaces/component/component.js";
import { ValueState } from "../../../_interfaces/component/states/value.js";
import { BaseStateModel } from "./_base.js";

export class ValueStateModel
  extends BaseStateModel<ValueStateData>
  implements ValueState
{
  // getters
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

  // data getters
  get data(): ValueStateData {
    return {
      ...super._data,
      type: "value",
    };
  }

  get data$(): Observable<ValueStateData> {
    return super._data$;
  }

  // constructor
  constructor({
    init,
    component,
  }: {
    init: ValueStateData;
    component: Component;
  }) {
    super({ init, component });
  }
}
