import { BaseStateData } from "@elllphnt/elementa-base";
import { assert, keyManager, RecordState } from "@elllphnt/elementa-utils";
import { Observable, of } from "rxjs";
import { Component } from "../../../../_interfaces/component/component.js";
import { BaseState } from "../../../../_interfaces/component/states/_base.js";
import { StatefulIdentifiable } from "../../_shared/identifiable.js";

export abstract class StatefulBaseState<
    T extends BaseStateData<string>,
    K extends keyof T = never
  >
  extends StatefulIdentifiable<T>
  implements BaseState<T["type"]>
{
  // readonly properties
  readonly type: T["type"];
  readonly component: Component;

  // protected properties
  protected _state: RecordState<Omit<T, "id" | "type" | K>>;

  // getters
  private get _baseState() {
    return this._state as RecordState<
      Omit<BaseStateData<T["type"]>, "id" | "type">
    >;
  }

  get name(): string | undefined {
    return this._baseState.entry("name");
  }

  get name$(): Observable<string | undefined> {
    return this._baseState.entry$("name");
  }

  get varName(): string | undefined {
    return this._baseState.entry("varName");
  }

  get varName$(): Observable<string | undefined> {
    return this._baseState.entry$("varName");
  }

  // data getters
  get _data(): BaseStateData<T["type"]> {
    return {
      ...super._data,
      type: this.type,
      ...this._state.record,
    };
  }

  get _data$(): Observable<BaseStateData<T["type"]>> {
    return of({
      ...super._data,
      type: this.type,
      ...this._state.record,
    });
  }

  abstract get data(): T;
  abstract get data$(): Observable<T>;

  // constructor
  constructor({ init, component }: { init: T; component: Component }) {
    const { id, type, ...stateData } = init;
    super({ id, key: keyManager.next("state") });

    this.type = type;
    this.component = component;

    this._state = new RecordState({
      init: stateData as Omit<T, "id" | "type" | K>,
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  // restore method
  restore(data: T): void {
    const { id, type, ...stateData } = data;
    assert(type === this.type, "State type mismatch");
    super.restore({ id });
    this._state.setRecord(stateData as Omit<T, "id" | "type" | K>);
  }
}
