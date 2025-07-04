import type { InlineStateData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import type { Component } from "../component/component.js";
import { BaseState } from "./_base.js";

export class InlineState extends BaseState<InlineStateData> {
  get script(): string | undefined {
    return this.state.entry("script");
  }

  get script$(): Observable<string | undefined> {
    return this.state.entry$("script");
  }

  constructor({
    state,
    component,
  }: {
    state: RecordState<InlineStateData>;
    component: Component;
  }) {
    super({ state, type: "inline", component });
  }
}
