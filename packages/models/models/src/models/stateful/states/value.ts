import { ValueStateData } from "@elllphnt/elementa-base";
import { Component, ValueState } from "@elllphnt/elementa-core";
import { Observable } from "rxjs";
import { StatefulBaseState } from "./_base.js";

export class StatefulValueState
  extends StatefulBaseState<ValueStateData>
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
