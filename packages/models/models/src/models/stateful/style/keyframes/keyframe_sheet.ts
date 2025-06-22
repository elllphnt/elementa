import { KeyframeSheetData } from "@elllphnt/elementa-base";
import {
  File,
  KeyframeSet,
  KeyframeSheet,
  Project,
} from "@elllphnt/elementa-core";
import {
  AggregatedModelList,
  combineLatestMerged,
  keyManager,
  RecordState,
} from "@elllphnt/elementa-utils";
import { combineLatest, map, Observable } from "rxjs";
import { StatefulModel } from "../../_base.js";
import { StatefulKeyframeSet } from "./keyframe_set.js";

export class StatefulKeyframeSheet
  extends StatefulModel<KeyframeSheetData>
  implements KeyframeSheet
{
  project: Project;

  private _state: RecordState<Omit<KeyframeSheetData, "keyframes">>;
  private _keyframes: AggregatedModelList<StatefulKeyframeSet>;

  get keyframeSets(): KeyframeSet[] {
    return this._keyframes.state.items;
  }

  get keyframeSets$(): Observable<KeyframeSet[]> {
    return this._keyframes.state.items$;
  }

  get data(): KeyframeSheetData {
    return {
      ...this._state.record,
      keyframes: this._keyframes.data,
    };
  }

  get data$(): Observable<KeyframeSheetData> {
    return combineLatestMerged([
      this._state.record$,
      combineLatest({
        keyframes: this._keyframes.data$,
      }),
    ]);
  }

  constructor({ init, file }: { init: KeyframeSheetData; file: File }) {
    const { keyframes, ...stateData } = init;
    super({ key: keyManager.next("keyframe-sheet") });

    this.project = file.project;

    this._state = new RecordState({
      init: stateData,
    });

    this._keyframes = new AggregatedModelList({
      init: keyframes || [],
      create: (data) =>
        new StatefulKeyframeSet({ init: data, project: this.project }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._keyframes.dispose();
    });
  }

  keyframeSet(id: string): KeyframeSet | undefined {
    return this._keyframes.state.items.find((k) => k.id === id);
  }

  keyframeSet$(id: string): Observable<KeyframeSet | undefined> {
    return this.keyframeSets$.pipe(
      map((keyframes) => keyframes.find((k) => k.id === id))
    );
  }

  addKeyframeSet(keyframe: KeyframeSet): void {
    // Convert the keyframe to data and add it
    this._keyframes.add((keyframe as StatefulKeyframeSet).data);
  }

  removeKeyframeSet(id: string): void {
    this._keyframes.state.remove((s) => s.id === id);
  }

  restore(data: KeyframeSheetData): void {
    const { keyframes, ...stateData } = data;
    this._state.setRecord(stateData);
    this._keyframes.restore(keyframes || []);
  }
}
