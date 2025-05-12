import { ValueStateData } from "@elllphnt/elementa-base";
import { combineLatestMerged } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
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

  get data(): ValueStateData {
    return {
      ...this._state.record,
      id: this._id,
      type: "value",
    };
  }

  get data$(): Observable<ValueStateData> {
    return combineLatestMerged([this._state.record$]);
  }

  restore(data: ValueStateData): void {
    this._state.setRecord({
      ...data,
      id: undefined,
      component: undefined,
    });
  }

  get init(): any {
    return this._state.record.init;
  }

  get init$(): Observable<any> {
    return this._state.entry$("init");
  }

  get tsType(): string | undefined {
    return this._state.record.tsType;
  }

  get tsType$(): Observable<string | undefined> {
    return this._state.entry$("tsType");
  }
}
