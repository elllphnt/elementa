import { Expression, HookStateData } from "@elllphnt/elementa-base";
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

  get args(): Expression[] | undefined {
    return this._state.entry("args");
  }

  get args$(): Observable<Expression[] | undefined> {
    return this._state.entry$("args");
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

  arg(index: number): Expression | undefined {
    return this.args?.[index];
  }

  arg$(index: number): Observable<Expression | undefined> {
    return this.args$.pipe(map((args) => args?.[index]));
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtHookState({
      crdt,
      component: this.component,
      initialized: true,
    }) as this;
  }
}
