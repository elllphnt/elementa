import {
  StyleVariableSetData,
  StyleVariableSheetData,
} from "@elllphnt/elementa-base";
import { AggregatedModelList, RecordState } from "@elllphnt/elementa-kernel";
import { map, Observable } from "rxjs";
import { ProjectModel } from "~/models/project.js";
import { Project } from "~/project/project.js";
import { StyleVariableSet } from "./style_variable_set.js";

export class StyleVariableSheet extends ProjectModel<
  RecordState<StyleVariableSheetData>
> {
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
    project,
    initialized,
  }: {
    state: RecordState<StyleVariableSheetData>;
    project: Project;
    initialized?: boolean;
  }) {
    super({ state, project });

    this._variableSets = new AggregatedModelList({
      state: state.getListOfRecordStates("variables"),
      create: (state, init) =>
        new StyleVariableSet({
          state,
          initialized: init && initialized,
          project: this.project,
        }),
    });

    this.addInitializer(() => {
      this._variableSets.initialize();

      this.addDisposer(() => {
        this._variableSets.dispose();
      });
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
