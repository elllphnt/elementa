import { StateData } from "@elllphnt/elementa-base";
import { keyManager, RecordState } from "@elllphnt/elementa-utils";
import { Observable, of } from "rxjs";
import { Component } from "../../../_interfaces/component/component.js";
import { State } from "../../../_interfaces/component/states/_state.js";
import { IdentifiableModel } from "../../_shared/identifiable.js";

export abstract class StateModel<T extends StateData>
  extends IdentifiableModel<T>
  implements State
{
  protected _state: RecordState<Omit<T, "id">>;
  protected _component: Component;
  protected _id: string;

  constructor({ init, component }: { init: T; component: Component }) {
    const { id, ...stateData } = init;
    super({ id, key: keyManager.next("state") });

    this._id = init.id;
    this._component = component;

    this._state = new RecordState({
      init: stateData,
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  get id(): string {
    return this._id;
  }

  get component(): Component {
    return this._component;
  }

  get type(): string {
    return this._state.record.type || "";
  }

  get name(): string | undefined {
    return this._state.entry("name");
  }

  get name$(): Observable<string | undefined> {
    return this._state.entry$("name");
  }

  get varName(): string | undefined {
    return this._state.entry("varName");
  }

  get varName$(): Observable<string | undefined> {
    return this._state.entry$("varName");
  }

  // Base data getters
  get _data(): Omit<T, "type"> {
    return {
      ...this._state.record,
      id: this._id,
    } as any;
  }

  get _data$(): Observable<Omit<T, "type">> {
    return of({
      ...this._state.record,
      id: this._id,
    } as any);
  }

  // Derived classes must implement these
  abstract get data(): T;
  abstract get data$(): Observable<T>;

  // Restore method
  restore(data: T): void {
    const { id, ...stateData } = data;
    this._state.setRecord(stateData);
  }
}
