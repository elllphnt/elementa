import { DataInputData } from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { Component } from "../../_interfaces/component/component.js";
import { DataInput } from "../../_interfaces/component/data_input.js";

export class DataInputModel extends Model<DataInputData> implements DataInput {
  private _state: RecordState<Omit<DataInputData, "component">>;
  private _component: Component;

  constructor({
    init,
    component,
  }: {
    init: DataInputData;
    component: Component;
  }) {
    super();

    this._component = component;

    const { component: _, ...stateData } = init;

    this._state = new RecordState({
      init: stateData,
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  get component(): Component {
    return this._component;
  }

  // data getters
  get data(): DataInputData {
    return {
      ...this._state.record,
    };
  }

  get data$(): Observable<DataInputData> {
    return this._state.record$;
  }

  // properties
  get name(): string {
    return this._state.entry("name") || "";
  }

  get name$(): Observable<string> {
    return this._state.entry$("name");
  }

  get varName(): string | undefined {
    return this._state.entry("varName");
  }

  get varName$(): Observable<string | undefined> {
    return this._state.entry$("varName");
  }

  get tsType(): string | undefined {
    return this._state.entry("tsType");
  }

  get tsType$(): Observable<string | undefined> {
    return this._state.entry$("tsType");
  }

  get required(): boolean | undefined {
    return this._state.entry("required");
  }

  get required$(): Observable<boolean | undefined> {
    return this._state.entry$("required");
  }

  get defaultValue(): any {
    return this._state.entry("defaultValue");
  }

  get defaultValue$(): Observable<any> {
    return this._state.entry$("defaultValue");
  }

  // restore method
  restore(data: DataInputData): void {
    const { component: _, ...stateData } = data;
    this._state.setRecord(stateData);
  }
}
