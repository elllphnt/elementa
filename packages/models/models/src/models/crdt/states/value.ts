import { ValueStateData } from "@elllphnt/elementa-base";
import { Component, ValueState } from "@elllphnt/elementa-core";
import { Observable } from "rxjs";
import * as y from "yjs";
import { CrdtBaseState } from "./_base.js";

export class CrdtValueState
  extends CrdtBaseState<ValueStateData>
  implements ValueState
{
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

  constructor({
    crdt,
    component,
    initialized,
  }: {
    crdt: y.Map<any>;
    component: Component;
    initialized?: boolean;
  }) {
    super({ crdt, type: "value", component, initialized });
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtValueState({
      crdt,
      component: this.component,
      initialized: true,
    }) as this;
  }
}
