import { StateData } from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { Component } from "../../../_interfaces/component/component.js";
import { State } from "../../../_interfaces/component/states/state.js";

export abstract class StateModel<T extends StateData>
  extends Model<T>
  implements State
{
  protected _state: RecordState<Partial<T>>;
  protected _component: Component;
  protected _id: string;

  constructor({ init, component }: { init: T; component: Component }) {
    super();

    this._component = component;
    this._id = init.id;

    this._state = new RecordState({
      init: {
        ...init,
        id: undefined,
        component: undefined,
      } as any,
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
    return this._state.record.name;
  }

  get name$(): Observable<string | undefined> {
    return this._state.entry$("name");
  }

  get varName(): string | undefined {
    return this._state.record.varName;
  }

  get varName$(): Observable<string | undefined> {
    return this._state.entry$("varName");
  }

  remove(): void {
    // Implementation will be handled by the parent component
  }

  abstract get data(): T;
  abstract get data$(): Observable<T>;
  abstract restore(data: T): void;
}
