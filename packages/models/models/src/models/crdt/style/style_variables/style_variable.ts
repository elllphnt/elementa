import { ensureField } from "@elllphnt/crdt";
import { StyleVariableData } from "@elllphnt/elementa-base";
import { StyleVariable } from "@elllphnt/elementa-core";
import {
  CrdtModel,
  CrdtRecordState,
  keyManager,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";

export class CrdtStyleVariable
  extends CrdtModel<y.Map<any>>
  implements StyleVariable
{
  private _state: CrdtRecordState<StyleVariableData>;

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

  constructor({
    crdt,
    initialized,
  }: {
    crdt: y.Map<any>;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("style-variable"), crdt });

    if (!initialized) {
      ensureField(crdt, "id", () =>
        Math.random().toString(36).substring(2, 10)
      );
    }

    this._state = new CrdtRecordState(crdt);

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

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

  protected factory(crdt: y.Map<any>): this {
    return new CrdtStyleVariable({
      crdt,
      initialized: true,
    }) as this;
  }
}
