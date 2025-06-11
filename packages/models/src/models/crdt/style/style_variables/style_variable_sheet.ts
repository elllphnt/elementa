import { ensureField, getOrCreateYArray } from "@elllphnt/crdt";
import { StyleVariableSheetData } from "@elllphnt/elementa-base";
import {
  File,
  Project,
  StyleVariableSet,
  StyleVariableSheet,
} from "@elllphnt/elementa-core";
import {
  AggregatedCrdtModelList,
  CrdtModel,
  CrdtRecordState,
  keyManager,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { CrdtStyleVariableSet } from "./style_variable_set.js";

export class CrdtStyleVariableSheet
  extends CrdtModel<y.Map<any>>
  implements StyleVariableSheet
{
  project: Project;
  file: File;

  private _state: CrdtRecordState<Omit<StyleVariableSheetData, "variables">>;
  private _variableSets: AggregatedCrdtModelList<CrdtStyleVariableSet>;

  get variableSets(): StyleVariableSet[] {
    return this._variableSets.models;
  }

  get variableSets$(): Observable<StyleVariableSet[]> {
    return this._variableSets.models$;
  }

  constructor({
    crdt,
    file,
    initialized,
  }: {
    crdt: y.Map<any>;
    file: File;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("style-variable-sheet"), crdt });

    this.project = file.project;
    this.file = file;

    if (!initialized) {
      ensureField(crdt, "variables", () => new y.Array());
    }

    this._state = new CrdtRecordState(crdt);

    this._variableSets = new AggregatedCrdtModelList({
      crdt: getOrCreateYArray<y.Map<any>>(crdt, "variables"),
      create: (crdt, init) =>
        new CrdtStyleVariableSet({ crdt, initialized: init && initialized }),
    });

    this.addDisposer(() => {
      this._state.dispose();
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
    const map = new y.Map();
    const crdtSet = new CrdtStyleVariableSet({ crdt: map, initialized: true });
    crdtSet.setName(set.name);
    if (set.datatype) {
      crdtSet.setDatatype(set.datatype);
    }
    if (set.modes) {
      crdtSet.setModes(set.modes);
    }
    this._variableSets.add([crdtSet]);
  }

  removeVariableSet(id: string): void {
    this._variableSets.state.remove((set) => set.get("id") === id);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtStyleVariableSheet({
      crdt,
      file: this.file,
      initialized: true,
    }) as this;
  }
}
