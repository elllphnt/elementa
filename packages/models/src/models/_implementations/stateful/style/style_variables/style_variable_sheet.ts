import {
  StyleVariableSetData,
  StyleVariableSheetData,
} from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  combineLatestMerged,
  keyManager,
  RecordState,
} from "@elllphnt/elementa-utils";
import { combineLatest, map, Observable } from "rxjs";
import { StyleVariableSet, StyleVariableSheet } from "~/models/style/_.js";
import { File, Project } from "~/project/_.js";
import { BaseModel } from "../../_base.js";
import { StyleVariableSetModel } from "./style_variable_set.js";

export class StyleVariableSheetModel
  extends BaseModel<StyleVariableSheetData>
  implements StyleVariableSheet
{
  project: Project;

  private _state: RecordState<Omit<StyleVariableSheetData, "variableSets">>;
  private _variableSets: AggregatedModelList<StyleVariableSetModel>;

  get variableSets(): StyleVariableSet[] {
    return this._variableSets.state.items;
  }

  get variableSets$(): Observable<StyleVariableSet[]> {
    return this._variableSets.state.items$;
  }

  get data(): StyleVariableSheetData {
    return {
      ...this._state.record,
      variableSets: this._variableSets.data,
    };
  }

  get data$(): Observable<StyleVariableSheetData> {
    return combineLatestMerged([
      this._state.record$,
      combineLatest({
        variableSets: this._variableSets.data$,
      }),
    ]);
  }

  constructor({ init, file }: { init: StyleVariableSheetData; file: File }) {
    const { variableSets, ...stateData } = init;
    super({ key: keyManager.next("style-variable-sheet") });

    this.project = file.project;

    this._state = new RecordState({
      init: stateData,
    });

    this._variableSets = new AggregatedModelList({
      init: variableSets || [],
      create: (data) => new StyleVariableSetModel({ init: data }),
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

  addVariableSet(data: StyleVariableSetData): StyleVariableSet {
    return this._variableSets.add(data);
  }

  removeVariableSet(id: string): void {
    this._variableSets.remove(id);
  }

  restore(data: StyleVariableSheetData): void {
    const { variableSets, ...stateData } = data;
    this._state.setRecord(stateData);
    this._variableSets.restore(variableSets || []);
  }
}
