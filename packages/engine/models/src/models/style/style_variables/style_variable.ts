import { StyleVariableData } from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";

export class StyleVariable extends Model<RecordState<StyleVariableData>> {
  get name(): string | undefined {
    return this.state.entry("name");
  }

  get name$(): Observable<string | undefined> {
    return this.state.entry$("name");
  }

  get values(): Record<string, any> | undefined {
    return this.state.entry("values");
  }

  get values$(): Observable<Record<string, any> | undefined> {
    return this.state.entry$("values");
  }

  constructor({ state }: { state: RecordState<StyleVariableData> }) {
    super({ state });
  }

  setName(name: string | undefined): void {
    this.state.set("name", name);
  }

  setValue(key: string, value: any): void {
    const values = this.values || {};
    this.state.set("values", { ...values, [key]: value });
  }

  removeValue(key: string): void {
    const values = { ...(this.values || {}) };
    delete values[key];
    this.state.set("values", values);
  }

  setValues(values: Record<string, any>): void {
    this.state.set("values", values);
  }
}
