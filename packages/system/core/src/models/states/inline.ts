import { InlineStateData } from "@elllphnt/elementa-base";
import { Component, InlineState } from "@elllphnt/elementa-core";
import { Observable } from "rxjs";
import * as y from "yjs";
import { CrdtBaseState } from "./_base.js";

export class CrdtInlineState
  extends CrdtBaseState<InlineStateData>
  implements InlineState
{
  get script(): string | undefined {
    return this._state.entry("script");
  }

  get script$(): Observable<string | undefined> {
    return this._state.entry$("script");
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
    super({ crdt, type: "inline", component, initialized });
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtInlineState({
      crdt,
      component: this.component,
      initialized: true,
    }) as this;
  }
}
