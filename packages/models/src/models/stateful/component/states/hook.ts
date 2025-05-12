import { Expression, HookStateData } from "@elllphnt/elementa-base";
import { combineLatestMerged } from "@elllphnt/elementa-utils";
import { Observable, map } from "rxjs";
import { Component } from "../../../_interfaces/component/component.js";
import { HookState } from "../../../_interfaces/component/states/hook.js";
import { StateModel } from "./state.js";

export class HookStateModel
  extends StateModel<HookStateData>
  implements HookState
{
  constructor({
    init,
    component,
  }: {
    init: HookStateData;
    component: Component;
  }) {
    super({ init, component });
  }

  get data(): HookStateData {
    return {
      ...this._state.record,
      id: this._id,
      type: "hook",
    };
  }

  get data$(): Observable<HookStateData> {
    return combineLatestMerged([this._state.record$]);
  }

  restore(data: HookStateData): void {
    this._state.setRecord({
      ...data,
      id: undefined,
      component: undefined,
    });
  }

  get hookUrl(): string | undefined {
    return this._state.record.hookUrl;
  }

  get hookUrl$(): Observable<string | undefined> {
    return this._state.entry$("hookUrl");
  }

  get absoluteHookUrl(): string | undefined {
    return this._state.record.absoluteHookUrl;
  }

  get absoluteHookUrl$(): Observable<string | undefined> {
    return this._state.entry$("absoluteHookUrl");
  }

  get args(): Expression[] | undefined {
    return this._state.record.args;
  }

  get args$(): Observable<Expression[] | undefined> {
    return this._state.entry$("args");
  }

  arg(index: number): Expression | undefined {
    return this.args?.[index];
  }

  arg$(index: number): Observable<Expression | undefined> {
    return this.args$.pipe(map((args) => args?.[index]));
  }
}
