import { ensureField, getOrCreateYArray } from "@elllphnt/crdt";
import {
  ElllSelectorData,
  StyleDataType,
  StyleVariableSetData,
} from "@elllphnt/elementa-base";
import { StyleVariable, StyleVariableSet } from "@elllphnt/elementa-core";
import {
  AggregatedCrdtModelList,
  CrdtModel,
  CrdtRecordState,
  keyManager,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { CrdtStyleVariable } from "./style_variable.js";

export class CrdtStyleVariableSet
  extends CrdtModel<y.Map<any>>
  implements StyleVariableSet
{
  private _state: CrdtRecordState<Omit<StyleVariableSetData, "variables">>;
  private _variables: AggregatedCrdtModelList<CrdtStyleVariable>;

  get id(): string {
    return this._state.entry("id") || "";
  }

  get name(): string {
    return this._state.entry("name") || "";
  }

  get name$(): Observable<string> {
    return this._state.entry$("name").pipe(map((name) => name || ""));
  }

  get datatype(): StyleDataType | undefined {
    return this._state.entry("datatype");
  }

  get datatype$(): Observable<StyleDataType | undefined> {
    return this._state.entry$("datatype");
  }

  get modes(): ElllSelectorData[] | undefined {
    return this._state.entry("modes");
  }

  get modes$(): Observable<ElllSelectorData[] | undefined> {
    return this._state.entry$("modes");
  }

  get variables(): StyleVariable[] {
    return this._variables.models;
  }

  get variables$(): Observable<StyleVariable[]> {
    return this._variables.models$;
  }

  constructor({
    crdt,
    initialized,
  }: {
    crdt: y.Map<any>;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("style-variable-set"), crdt });

    if (!initialized) {
      ensureField(crdt, "id", () =>
        Math.random().toString(36).substring(2, 10)
      );
      ensureField(crdt, "name", () => "");
      ensureField(crdt, "variables", () => new y.Array());
    }

    this._state = new CrdtRecordState(crdt);

    this._variables = new AggregatedCrdtModelList({
      crdt: getOrCreateYArray<y.Map<any>>(crdt, "variables"),
      create: (crdt, init) =>
        new CrdtStyleVariable({ crdt, initialized: init && initialized }),
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._variables.dispose();
    });
  }

  setName(name: string): void {
    this._state.set("name", name);
  }

  setDatatype(datatype: StyleDataType | undefined): void {
    this._state.set("datatype", datatype);
  }

  setModes(modes: ElllSelectorData[] | undefined): void {
    this._state.set("modes", modes);
  }

  addVariable(variable: StyleVariable): void {
    const map = new y.Map();
    const crdtVariable = new CrdtStyleVariable({
      crdt: map,
      initialized: true,
    });
    crdtVariable.setName(variable.name);
    if (variable.values) {
      crdtVariable.setValues(variable.values);
    }
    this._variables.add([crdtVariable]);
  }
  removeVariable(index: number): void {
    this._variables.state.removeAt(index);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtStyleVariableSet({
      crdt,
      initialized: true,
    }) as this;
  }
}
