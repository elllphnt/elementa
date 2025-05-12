import { Expression, HookStateData } from "@elllphnt/elementa-base";
import { Observable, map } from "rxjs";
import { Component } from "../../../_interfaces/component/component.js";
import { HookState } from "../../../_interfaces/component/states/hook.js";
import { BaseStateModel } from "./_base.js";

export class HookStateModel
  extends BaseStateModel<HookStateData>
  implements HookState
{
  // getters
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

  // data getters
  get data(): HookStateData {
    return {
      ...super._data,
      type: "hook",
    };
  }

  get data$(): Observable<HookStateData> {
    return super._data$;
  }

  // constructor
  constructor({
    init,
    component,
  }: {
    init: HookStateData;
    component: Component;
  }) {
    super({ init, component });
  }

  // methods
  arg(index: number): Expression | undefined {
    return this.args?.[index];
  }

  arg$(index: number): Observable<Expression | undefined> {
    return this.args$.pipe(map((args) => args?.[index]));
  }
}
