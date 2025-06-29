import { InlineStateData } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-kernel";
import { Observable } from "rxjs";
import { Component } from "../component/component.js";
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
