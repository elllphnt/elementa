import { InlineStateData } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { BaseState } from "./_base.js";
import { Component } from "../component/component.js";

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
