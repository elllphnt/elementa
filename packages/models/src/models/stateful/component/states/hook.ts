import { Expression, HookStateData } from "@elllphnt/elementa-base";
import { combineLatestMerged } from "@elllphnt/elementa-utils";
import { Observable, map, of } from "rxjs";
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

  // data getters
  get data(): HookStateData {
    return {
      ...super._data,
      type: "hook",
    };
  }

  get data$(): Observable<HookStateData> {
    return combineLatestMerged([super._data$, of({ type: "hook" as const })]);
  }

  get hookUrl(): string | undefined {
    return this._state.entry("hookUrl");
  }

  get hookUrl$(): Observable<string | undefined> {
    return this._state.entry$("hookUrl");
  }

  get args(): Expression[] | undefined {
    return this._state.entry("args");
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
