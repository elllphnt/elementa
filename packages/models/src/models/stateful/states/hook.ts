import { HookStateData } from "@elllphnt/elementa-base";
import { Component, HookState } from "@elllphnt/elementa-core";
import { Observable, map } from "rxjs";
import { StatefulBaseState } from "./_base.js";

export class StatefulHookState
  extends StatefulBaseState<HookStateData>
  implements HookState
{
  // getters
  get hookUrl(): string | undefined {
    return this._state.entry("hookUrl");
  }
  get hookUrl$(): Observable<string | undefined> {
    return this._state.entry$("hookUrl");
  }

  get argMode(): "positional" | "named" {
    return this._state.entry("argMode") || "named";
  }
  get argMode$(): Observable<"positional" | "named"> {
    return this._state
      .entry$("argMode")
      .pipe(map((argMode) => argMode || "named"));
  }

  get args(): Record<string, any> {
    return this._state.entry("args") || {};
  }
  get args$(): Observable<Record<string, any>> {
    return this._state.entry$("args").pipe(map((args) => args || {}));
  }

  // methods
  arg(key: string): any {
    return this.args?.[key];
  }
  arg$(key: string): Observable<any> {
    return this.args$.pipe(map((args) => args?.[key]));
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
}
