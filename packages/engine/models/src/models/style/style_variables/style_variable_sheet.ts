import {
  StyleVariableSetData,
  StyleVariableSheetData,
} from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  Model,
  RecordState,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import { File } from "~/project/file/file.js";
import { Project } from "~/project/project.js";
import { StyleVariableSet } from "./style_variable_set.js";

export class StyleVariableSheet extends Model<
  RecordState<StyleVariableSheetData>
> {
  project: Project;
  file: File;

  private _variableSets: AggregatedModelList<
    RecordState<StyleVariableSetData>,
    StyleVariableSet
  >;

  get variableSets(): StyleVariableSet[] {
    return this._variableSets.models;
  }

  get variableSets$(): Observable<StyleVariableSet[]> {
    return this._variableSets.models$;
  }

  constructor({
    state,
    file,
    initialized,
  }: {
    state: RecordState<StyleVariableSheetData>;
    file: File;
    initialized?: boolean;
  }) {
    super({ state });
    this.file = file;
    this.project = file.project;

    this._variableSets = new AggregatedModelList({
      state: state.getAggregatedStateList("variables"),
      create: (state, init) =>
        new StyleVariableSet({
          state,
          initialized: init && initialized,
        }),
    });

    this.addDisposer(() => {
      this._variableSets.dispose();
    });
  }

  variableSet(id: string): StyleVariableSet | undefined {
    return this._variableSets.models.find((vs) => vs.id === id);
  }

  variableSet$(id: string): Observable<StyleVariableSet | undefined> {
    return this.variableSets$.pipe(
      map((variableSets) => variableSets.find((vs) => vs.id === id))
    );
  }

  variableSetByName(name: string): StyleVariableSet | undefined {
    return this._variableSets.models.find((vs) => vs.name === name);
  }

  variableSetByName$(name: string): Observable<StyleVariableSet | undefined> {
    return this.variableSets$.pipe(
      map((variableSets) => variableSets.find((vs) => vs.name === name))
    );
  }

  addVariableSet(set: StyleVariableSet): void {
    this._variableSets.add(set);
  }

  removeVariableSet(id: string): void {
    this._variableSets.state.remove((s) => s.entry("id") === id);
  }
}
