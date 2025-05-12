import { DataInputData } from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { Component } from "../../_interfaces/component/component.js";
import { DataInput } from "../../_interfaces/component/data_input.js";

export class DataInputModel extends Model<DataInputData> implements DataInput {
  private _state: RecordState<Partial<DataInputData>>;
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

    this._state = new RecordState({
      init: {
        ...init,
        component: undefined,
      },
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  get component(): Component {
    return this._component;
  }

  get data(): DataInputData {
    return {
      ...this._state.record,
    };
  }

  get data$(): Observable<DataInputData> {
    return this._state.record$;
  }

  restore(data: DataInputData): void {
    this._state.setRecord({
      ...data,
      component: undefined,
    });
  }

  get name(): string {
    return this._state.record.name || "";
  }

  get name$(): Observable<string> {
    return this._state.entry$("name");
  }

  get varName(): string | undefined {
    return this._state.record.varName;
  }

  get varName$(): Observable<string | undefined> {
    return this._state.entry$("varName");
  }

  get tsType(): string | undefined {
    return this._state.record.tsType;
  }

  get tsType$(): Observable<string | undefined> {
    return this._state.entry$("tsType");
  }

  get required(): boolean | undefined {
    return this._state.record.required;
  }

  get required$(): Observable<boolean | undefined> {
    return this._state.entry$("required");
  }

  get defaultValue(): any {
    return this._state.record.defaultValue;
  }

  get defaultValue$(): Observable<any> {
    return this._state.entry$("defaultValue");
  }
}
