import { BaseStateData } from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { Component } from "../component/_.js";

export abstract class BaseState<T extends BaseStateData<string>> extends Model<
  RecordState<T>
> {
  readonly type: T["type"];
  readonly component: Component;

  get id(): string {
    return this.state.entry("id")!;
  }

  get name(): string | undefined {
    return this.state.entry("name");
  }
  get name$(): Observable<string | undefined> {
    return this.state.entry$("name");
  }

  get varName(): string | undefined {
    return this.state.entry("varName");
  }
  get varName$(): Observable<string | undefined> {
    return this.state.entry$("varName");
  }

  constructor({
    state,
    type,
    component,
  }: {
    state: RecordState<T>;
    type: T["type"];
    component: Component;
  }) {
    super({ state });

    this.type = type;
    this.component = component;
  }
}
