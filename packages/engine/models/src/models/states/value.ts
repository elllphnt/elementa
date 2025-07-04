import type { ValueStateData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import type { Component } from "../component/component.js";
import { BaseState } from "./_base.js";

export class ValueState extends BaseState<ValueStateData> {
  get init(): any {
    return this.state.entry("init");
  }

  get init$(): Observable<any> {
    return this.state.entry$("init");
  }

  get tsType(): string | undefined {
    return this.state.entry("tsType");
  }

  get tsType$(): Observable<string | undefined> {
    return this.state.entry$("tsType");
  }

  constructor({
    state,
    component,
  }: {
    state: RecordState<ValueStateData>;
    component: Component;
  }) {
    super({ state, type: "value", component });
  }
}
