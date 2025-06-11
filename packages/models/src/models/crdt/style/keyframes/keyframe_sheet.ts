import { ensureField, getOrCreateYArray } from "@elllphnt/crdt";
import { KeyframeSheetData } from "@elllphnt/elementa-base";
import {
  File,
  KeyframeSet,
  KeyframeSheet,
  Project,
} from "@elllphnt/elementa-core";
import {
  AggregatedCrdtModelList,
  CrdtModel,
  CrdtRecordState,
  keyManager,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { CrdtKeyframeSet } from "./keyframe_set.js";

export class CrdtKeyframeSheet
  extends CrdtModel<y.Map<any>>
  implements KeyframeSheet
{
  project: Project;
  file: File;

  private _state: CrdtRecordState<Omit<KeyframeSheetData, "keyframes">>;
  private _keyframes: AggregatedCrdtModelList<CrdtKeyframeSet>;

  get keyframeSets(): KeyframeSet[] {
    return this._keyframes.models;
  }

  get keyframeSets$(): Observable<KeyframeSet[]> {
    return this._keyframes.models$;
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
    super({ key: keyManager.next("keyframe-sheet"), crdt });
    this.file = file;
    this.project = file.project;

    if (!initialized) {
      ensureField(crdt, "keyframes", () => new y.Array());
    }

    this._state = new CrdtRecordState(crdt);

    this._keyframes = new AggregatedCrdtModelList({
      crdt: getOrCreateYArray<y.Map<any>>(crdt, "keyframes"),
      create: (crdt, init) =>
        new CrdtKeyframeSet({
          crdt,
          project: this.project,
          initialized: init && initialized,
        }),
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._keyframes.dispose();
    });
  }

  keyframeSet(id: string): KeyframeSet | undefined {
    return this._keyframes.models.find((k) => k.id === id);
  }

  keyframeSet$(id: string): Observable<KeyframeSet | undefined> {
    return this.keyframeSets$.pipe(
      map((keyframes) => keyframes.find((k) => k.id === id))
    );
  }

  addKeyframeSet(keyframeSet: CrdtKeyframeSet): void {
    this._keyframes.add([keyframeSet]);
  }
  removeKeyframeSet(id: string): void {
    this._keyframes.state.remove((s) => s.get("id") === id);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtKeyframeSheet({
      crdt,
      file: this.file,
      initialized: true,
    }) as this;
  }
}
