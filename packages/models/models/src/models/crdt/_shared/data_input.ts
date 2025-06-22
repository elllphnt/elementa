import { DataInputData } from "@elllphnt/elementa-base";
import { DataInput } from "@elllphnt/elementa-core";
import { CrdtModel, CrdtRecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";

export class CrdtDataInput extends CrdtModel<y.Map<any>> implements DataInput {
  private _state: CrdtRecordState<DataInputData>;

  constructor({ crdt }: { crdt: y.Map<any>; initialized?: boolean }) {
    super({ crdt });

    this._state = new CrdtRecordState(crdt);

    this.addDisposer(() => {
      this._state.dispose();
    });
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

  // setters
  setName(name: string): void {
    this._state.set("name", name);
  }

  setVarName(varName: string | undefined): void {
    this._state.set("varName", varName);
  }

  setTsType(tsType: string | undefined): void {
    this._state.set("tsType", tsType);
  }

  setRequired(required: boolean | undefined): void {
    this._state.set("required", required);
  }

  setDefaultValue(defaultValue: any): void {
    this._state.set("defaultValue", defaultValue);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtDataInput({
      crdt,
      initialized: true,
    }) as this;
  }
}
