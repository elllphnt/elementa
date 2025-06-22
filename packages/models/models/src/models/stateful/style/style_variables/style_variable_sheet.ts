import { StyleVariableSheetData } from "@elllphnt/elementa-base";
import {
  File,
  Project,
  StyleVariableSet,
  StyleVariableSheet,
} from "@elllphnt/elementa-core";
import {
  AggregatedModelList,
  combineLatestMerged,
  keyManager,
  RecordState,
} from "@elllphnt/elementa-utils";
import { combineLatest, map, Observable } from "rxjs";
import { StatefulModel } from "../../_base.js";
import { StatefulStyleVariableSet } from "./style_variable_set.js";

export class StatefulStyleVariableSheet
  extends StatefulModel<StyleVariableSheetData>
  implements StyleVariableSheet
{
  project: Project;

  private _state: RecordState<Omit<StyleVariableSheetData, "variables">>;
  private _variableSets: AggregatedModelList<StatefulStyleVariableSet>;

  get variableSets(): StyleVariableSet[] {
    return this._variableSets.state.items;
  }

  get variableSets$(): Observable<StyleVariableSet[]> {
    return this._variableSets.state.items$;
  }

  get data(): StyleVariableSheetData {
    return {
      ...this._state.record,
      variables: this._variableSets.data,
    };
  }

  get data$(): Observable<StyleVariableSheetData> {
    return combineLatestMerged([
      this._state.record$,
      combineLatest({
        variables: this._variableSets.data$,
      }),
    ]);
  }

  constructor({ init, file }: { init: StyleVariableSheetData; file: File }) {
    const { variables, ...stateData } = init;
    super({ key: keyManager.next("style-variable-sheet") });

    this.project = file.project;

    this._state = new RecordState({
      init: stateData,
    });

    this._variableSets = new AggregatedModelList({
      init: variables || [],
      create: (data) => new StatefulStyleVariableSet({ init: data }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._variableSets.dispose();
    });
  }

  variableSet(id: string): StyleVariableSet | undefined {
    return this._variableSets.state.items.find((vs) => vs.id === id);
  }

  variableSet$(id: string): Observable<StyleVariableSet | undefined> {
    return this.variableSets$.pipe(
      map((variableSets) => variableSets.find((vs) => vs.id === id))
    );
  }

  variableSetByName(name: string): StyleVariableSet | undefined {
    return this._variableSets.state.items.find((vs) => vs.name === name);
  }

  variableSetByName$(name: string): Observable<StyleVariableSet | undefined> {
    return this.variableSets$.pipe(
      map((variableSets) => variableSets.find((vs) => vs.name === name))
    );
  }

  addVariableSet(set: StatefulStyleVariableSet): void {
    return this._variableSets.state.add(set);
  }
  removeVariableSet(id: string): void {
    this._variableSets.state.remove((set) => set.id === id);
  }

  restore(data: StyleVariableSheetData): void {
    const { variables, ...stateData } = data;
    this._state.setRecord(stateData);
    this._variableSets.restore(variables || []);
  }
}
