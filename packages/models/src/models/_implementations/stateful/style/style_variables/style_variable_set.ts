import {
  ElllSelectorData,
  StyleDataType,
  StyleVariableData,
  StyleVariableSetData,
} from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  combineLatestMerged,
  keyManager,
  RecordState,
} from "@elllphnt/elementa-utils";
import { combineLatest, map, Observable } from "rxjs";
import { StyleVariable, StyleVariableSet } from "~/models/style/_.js";
import { IdentifiableModel } from "../../_shared/identifiable.js";
import { StyleVariableModel } from "./style_variable.js";

export class StyleVariableSetModel
  extends IdentifiableModel<StyleVariableSetData>
  implements StyleVariableSet
{
  private _state: RecordState<Omit<StyleVariableSetData, "id" | "variables">>;
  private _variables: AggregatedModelList<StyleVariableModel>;

  get name(): string {
    return this._state.entry("name") || "";
  }

  get name$(): Observable<string> {
    return this._state.entry$("name");
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
    return this._variables.state.items;
  }

  get variables$(): Observable<StyleVariable[]> {
    return this._variables.state.items$;
  }

  get data(): StyleVariableSetData {
    return {
      ...super._data,
      ...this._state.record,
      variables: this._variables.data,
    };
  }

  get data$(): Observable<StyleVariableSetData> {
    return combineLatestMerged([
      super._data$,
      this._state.record$,
      combineLatest({
        variables: this._variables.data$,
      }),
    ]);
  }

  constructor({ init }: { init: StyleVariableSetData }) {
    const { id, variables, ...stateData } = init;
    super({ id, key: keyManager.next("style-variable-set") });

    this._state = new RecordState({
      init: stateData,
    });

    this._variables = new AggregatedModelList({
      init: variables || [],
      create: (data) => new StyleVariableModel({ init: data }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._variables.dispose();
    });
  }

  variable(id: string): StyleVariable | undefined {
    return this._variables.state.items.find((v) => v.id === id);
  }

  variable$(id: string): Observable<StyleVariable | undefined> {
    return this.variables$.pipe(
      map((variables) => variables.find((v) => v.id === id))
    );
  }

  setName(name: string): void {
    this._state.setEntry("name", name);
  }

  setDatatype(datatype: StyleDataType | undefined): void {
    this._state.setEntry("datatype", datatype);
  }

  setModes(modes: ElllSelectorData[] | undefined): void {
    this._state.setEntry("modes", modes);
  }

  addVariable(data: StyleVariableData): StyleVariable {
    return this._variables.add(data);
  }

  removeVariable(id: string): void {
    this._variables.remove(id);
  }

  restore(data: StyleVariableSetData): void {
    const { id, variables, ...stateData } = data;
    super.restore({ id });
    this._state.setRecord(stateData);
    this._variables.restore(variables || []);
  }
}
