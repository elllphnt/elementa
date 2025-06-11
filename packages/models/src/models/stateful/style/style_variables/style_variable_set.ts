import {
  ElllSelectorData,
  StyleDataType,
  StyleVariableSetData,
} from "@elllphnt/elementa-base";
import { StyleVariable, StyleVariableSet } from "@elllphnt/elementa-core";
import {
  AggregatedModelList,
  combineLatestMerged,
  keyManager,
  RecordState,
} from "@elllphnt/elementa-utils";
import { combineLatest, map, Observable } from "rxjs";
import { StatefulIdentifiable } from "../../_shared/identifiable.js";
import { StatefulStyleVariable } from "./style_variable.js";

export class StatefulStyleVariableSet
  extends StatefulIdentifiable<StyleVariableSetData>
  implements StyleVariableSet
{
  private _state: RecordState<Omit<StyleVariableSetData, "id" | "variables">>;
  private _variables: AggregatedModelList<StatefulStyleVariable>;

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
      create: (data) => new StatefulStyleVariable({ init: data }),
      dataRef: () => 0,
      modelRef: () => 0,
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
    this._state.set("name", name);
  }
  setDatatype(datatype: StyleDataType | undefined): void {
    this._state.set("datatype", datatype);
  }
  setModes(modes: ElllSelectorData[] | undefined): void {
    this._state.set("modes", modes);
  }

  addVariable(variable: StatefulStyleVariable) {
    return this._variables.state.add(variable);
  }
  removeVariable(id: string): void {
    this._variables.state.remove((v) => v.id === id);
  }

  restore(data: StyleVariableSetData): void {
    const { id, variables, ...stateData } = data;
    super.restore({ id });
    this._state.setRecord(stateData);
    this._variables.restore(variables || []);
  }
}
