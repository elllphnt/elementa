import { InlineStateData } from "@elllphnt/elementa-base";
import { Component, InlineState } from "@elllphnt/elementa-core";
import { Observable } from "rxjs";
import { StatefulBaseState } from "./_base.js";

export class StatefulInlineState
  extends StatefulBaseState<InlineStateData>
  implements InlineState
{
  // getters
  get script(): string | undefined {
    return this._state.entry("script");
  }

  get script$(): Observable<string | undefined> {
    return this._state.entry$("script");
  }

  // data getters
  get data(): InlineStateData {
    return {
      ...super._data,
      type: "inline",
    };
  }

  get data$(): Observable<InlineStateData> {
    return super._data$;
  }

  // constructor
  constructor({
    init,
    component,
  }: {
    init: InlineStateData;
    component: Component;
  }) {
    super({ init, component });
  }
}
