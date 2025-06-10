import { StyleVariableData } from "@elllphnt/elementa-base";
import {
  combineLatestMerged,
  keyManager,
  RecordState,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { StyleVariable } from "~/models/style/_.js";
import { IdentifiableModel } from "../../_shared/identifiable.js";

export class StyleVariableModel
  extends IdentifiableModel<StyleVariableData>
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
      ...super._data,
      ...this._state.record,
    };
  }

  get data$(): Observable<StyleVariableData> {
    return combineLatestMerged([super._data$, this._state.record$]);
  }

  constructor({ init }: { init: StyleVariableData }) {
    const { id, ...stateData } = init;
    super({ id, key: keyManager.next("style-variable") });

    this._state = new RecordState({
      init: stateData,
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  setName(name: string | undefined): void {
    this._state.setEntry("name", name);
  }

  setValue(key: string, value: any): void {
    const values = this.values || {};
    this._state.setEntry("values", { ...values, [key]: value });
  }

  removeValue(key: string): void {
    const values = this.values || {};
    const { [key]: _, ...rest } = values;
    this._state.setEntry(
      "values",
      Object.keys(rest).length > 0 ? rest : undefined
    );
  }

  setValues(values: Record<string, any>): void {
    this._state.setEntry("values", values);
  }

  restore(data: StyleVariableData): void {
    const { id, ...stateData } = data;
    super.restore({ id });
    this._state.setRecord(stateData);
  }
}
