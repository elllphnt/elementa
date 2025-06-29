import {
  ElllSelectorData,
  StyleDataType,
  StyleVariableData,
  StyleVariableSetData,
} from "@elllphnt/elementa-base";
import { AggregatedModelList, RecordState } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import { genId } from "~/_lib/id.js";
import { Identifiable } from "~/models/_.js";
import { StyleVariable } from "./style_variable.js";

export class StyleVariableSet extends Identifiable<StyleVariableSetData> {
  private _variables: AggregatedModelList<
    RecordState<StyleVariableData>,
    StyleVariable
  >;

  get id(): string {
    return this.state.entry("id") || "";
  }

  get name(): string {
    return this.state.entry("name") || "";
  }

  get name$(): Observable<string> {
    return this.state.entry$("name").pipe(map((name) => name || ""));
  }

  get datatype(): StyleDataType | undefined {
    return this.state.entry("datatype");
  }

  get datatype$(): Observable<StyleDataType | undefined> {
    return this.state.entry$("datatype");
  }

  get modes(): ElllSelectorData[] | undefined {
    return this.state.entry("modes");
  }

  get modes$(): Observable<ElllSelectorData[] | undefined> {
    return this.state.entry$("modes");
  }

  get variables(): StyleVariable[] {
    return this._variables.models;
  }

  get variables$(): Observable<StyleVariable[]> {
    return this._variables.models$;
  }

  constructor({
    state,
    initialized,
  }: {
    state: RecordState<StyleVariableSetData>;
    initialized?: boolean;
  }) {
    super({ state });

    if (!initialized) {
      state.set("id", genId());
    }

    this._variables = new AggregatedModelList({
      state: state.getAggregatedStateList("variables"),
      create: (state) =>
        new StyleVariable({
          state,
        }),
    });

    this.addDisposer(() => {
      this.state.dispose();
      this._variables.dispose();
    });
  }

  setName(name: string): void {
    this.state.set("name", name);
  }

  setDatatype(datatype: StyleDataType | undefined): void {
    this.state.set("datatype", datatype);
  }

  setModes(modes: ElllSelectorData[] | undefined): void {
    this.state.set("modes", modes);
  }

  addVariable(variable: StyleVariable): void {
    this._variables.add(variable);
  }
  removeVariable(index: number): void {
    this._variables.state.removeAt(index);
  }
}
