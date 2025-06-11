import { StyleVariableData } from "@elllphnt/elementa-base";
import { StyleVariable } from "@elllphnt/elementa-core";
import {
  combineLatestMerged,
  keyManager,
  RecordState,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { StatefulModel } from "../../_base.js";

export class StatefulStyleVariable
  extends StatefulModel<StyleVariableData>
  implements StyleVariable
{
  private _state: RecordState<Omit<StyleVariableData, "id">>;

  get name(): string | undefined {
    return this._state.entry("name");
  }
  get name$(): Observable<string | undefined> {
    return this._state.entry$("name");
  }

  get values(): Record<string, any> | undefined {
    return this._state.entry("values");
  }
  get values$(): Observable<Record<string, any> | undefined> {
    return this._state.entry$("values");
  }

  get data(): StyleVariableData {
    return {
      ...this._state.record,
    };
  }

  get data$(): Observable<StyleVariableData> {
    return combineLatestMerged([this._state.record$]);
  }

  constructor({ init }: { init: StyleVariableData }) {
    const { ...stateData } = init;
    super({ key: keyManager.next("style-variable") });

    this._state = new RecordState({
      init: stateData,
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }
  id: string;

  setName(name: string | undefined): void {
    this._state.set("name", name);
  }

  setValue(key: string, value: any): void {
    const values = this.values || {};
    this._state.set("values", { ...values, [key]: value });
  }
  removeValue(key: string): void {
    const values = { ...(this.values || {}) };
    delete values[key];
    this._state.set("values", values);
  }
  setValues(values: Record<string, any>): void {
    this._state.set("values", values);
  }

  restore(data: StyleVariableData): void {
    const { ...stateData } = data;
    this._state.setRecord(stateData);
  }
}
