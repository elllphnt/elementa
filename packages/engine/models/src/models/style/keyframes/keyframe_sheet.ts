import { KeyframeSetData, KeyframeSheetData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  Model,
  RecordState,
} from "@elllphnt/elementa-kernel";
import { map, Observable } from "rxjs";
import { File } from "~/project/file/file.js";
import { Project } from "~/project/project.js";
import { KeyframeSet } from "./keyframe_set.js";

export class KeyframeSheet extends Model<RecordState<KeyframeSheetData>> {
  project: Project;
  file: File;

  private _keyframes: AggregatedModelList<
    RecordState<KeyframeSetData>,
    KeyframeSet
  >;

  get keyframeSets(): KeyframeSet[] {
    return this._keyframes.models;
  }
  get keyframeSets$(): Observable<KeyframeSet[]> {
    return this._keyframes.models$;
  }

  constructor({
    state,
    file,
    initialized,
  }: {
    state: RecordState<KeyframeSheetData>;
    file: File;
    initialized?: boolean;
  }) {
    super({ state });
    this.file = file;
    this.project = file.project;

    this._keyframes = new AggregatedModelList({
      state: state.getAggregatedStateList("keyframes"),
      create: (state, init) =>
        new KeyframeSet({
          state,
          project: this.project,
          initialized: init && initialized,
        }),
    });

    this.addDisposer(() => {
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

  addKeyframeSet(keyframeSet: KeyframeSet): void {
    this._keyframes.add(keyframeSet);
  }
  removeKeyframeSet(id: string): void {
    this._keyframes.state.remove((s) => s.entry("id") === id);
  }
}
