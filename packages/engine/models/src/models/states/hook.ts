import type { HookStateData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { map } from "rxjs";
import type { Component } from "../component/component.js";
import { BaseState } from "./_base.js";

export class HookState extends BaseState<HookStateData> {
  get hookRef() {
    return this.state.entry("hookRef");
  }

  get hookRef$() {
    return this.state.entry$("hookRef");
  }

  get args() {
    return this.state.entry("args") || {};
  }

  get args$() {
    return this.state.entry$("args").pipe(map((args) => args || {}));
  }

  constructor({
    state,
    component,
  }: {
    state: RecordState<HookStateData>;
    component: Component;
  }) {
    super({ state, type: "hook", component });
  }
}
