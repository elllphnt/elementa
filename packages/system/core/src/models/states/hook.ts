import { HookStateData } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-utils";
import { Observable, map } from "rxjs";
import { BaseState } from "./_base.js";
import { Component } from "../component/component.js";

export class HookState extends BaseState<HookStateData> {
  get hookUrl(): string | undefined {
    return this.state.entry("hookUrl");
  }

  get hookUrl$(): Observable<string | undefined> {
    return this.state.entry$("hookUrl");
  }

  get argMode(): "positional" | "named" {
    return this.state.entry("argMode") || "named";
  }

  get argMode$(): Observable<"positional" | "named"> {
    return this.state
      .entry$("argMode")
      .pipe(map((argMode) => argMode || "named"));
  }

  get args(): Record<string, any> {
    return this.state.entry("args") || {};
  }

  get args$(): Observable<Record<string, any>> {
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

  arg(key: string): any {
    return this.args?.[key];
  }

  arg$(key: string): Observable<any> {
    return this.args$.pipe(map((args) => args?.[key]));
  }
}
