import type { KeyframeSetData, KeyframeSheetData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { AggregatedModelList } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import { map } from "rxjs";
import { ProjectModel } from "~/models/project.js";
import type { Project } from "~/project/project.js";
import { KeyframeSet } from "./keyframe_set.js";

export class KeyframeSheet extends ProjectModel<
  RecordState<KeyframeSheetData>
> {
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
    project,
    initialized,
  }: {
    state: RecordState<KeyframeSheetData>;
    project: Project;
    initialized?: boolean;
  }) {
    super({ state, project });

    this._keyframes = new AggregatedModelList({
      state: state.getListOfRecordStates("keyframes"),
      create: (state, init) =>
        new KeyframeSet({
          state,
          project: this.project,
          initialized: init && initialized,
        }),
    });

    this.addInitializer(() => {
      this._keyframes.initialize();

      this.addDisposer(() => {
        this._keyframes.dispose();
      });
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
