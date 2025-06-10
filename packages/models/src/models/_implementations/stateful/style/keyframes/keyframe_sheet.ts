import { KeyframeSheetData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  combineLatestMerged,
  keyManager,
  RecordState,
} from "@elllphnt/elementa-utils";
import { combineLatest, map, Observable } from "rxjs";
import { Keyframe, KeyframeSheet } from "~/models/style/_.js";
import { File, Project } from "~/project/_.js";
import { StatefulModel } from "../../_base.js";

export class StatefulKeyframeSheet
  extends StatefulModel<KeyframeSheetData>
  implements KeyframeSheet
{
  project: Project;

  private _state: RecordState<Omit<KeyframeSheetData, "keyframes">>;
  private _keyframes: AggregatedModelList<StatefulKeyframe>;

  get keyframes(): Keyframe[] {
    return this._keyframes.state.items;
  }

  get keyframes$(): Observable<Keyframe[]> {
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
      create: (data) => new StatefulKeyframe({ init: data }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._keyframes.dispose();
    });
  }

  keyframe(id: string): Keyframe | undefined {
    return this._keyframes.state.items.find((k) => k.id === id);
  }

  keyframe$(id: string): Observable<Keyframe | undefined> {
    return this.keyframes$.pipe(
      map((keyframes) => keyframes.find((k) => k.id === id))
    );
  }

  addKeyframe(keyframe: Keyframe): void {
    // Convert the keyframe to data and add it
    this._keyframes.add((keyframe as StatefulKeyframe).data);
  }

  removeKeyframe(id: string): void {
    this._keyframes.remove(id);
  }

  restore(data: KeyframeSheetData): void {
    const { keyframes, ...stateData } = data;
    this._state.setRecord(stateData);
    this._keyframes.restore(keyframes || []);
  }
}
