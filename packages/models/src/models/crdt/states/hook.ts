import { HookStateData } from "@elllphnt/elementa-base";
import { Component, HookState } from "@elllphnt/elementa-core";
import { Observable, map } from "rxjs";
import * as y from "yjs";
import { CrdtBaseState } from "./_base.js";

export class CrdtHookState
  extends CrdtBaseState<HookStateData>
  implements HookState
{
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

  constructor({
    crdt,
    component,
    initialized,
  }: {
    crdt: y.Map<any>;
    component: Component;
    initialized?: boolean;
  }) {
    super({ crdt, type: "hook", component, initialized });
  }

  arg(key: string): any {
    return this.args?.[key];
  }

  arg$(key: string): Observable<any> {
    return this.args$.pipe(map((args) => args?.[key]));
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtHookState({
      crdt,
      component: this.component,
      initialized: true,
    }) as this;
  }
}
