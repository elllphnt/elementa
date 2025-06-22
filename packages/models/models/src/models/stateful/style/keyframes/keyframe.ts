import { KeyFrameData } from "@elllphnt/elementa-base";
import {
  Keyframe,
  Project,
  StyleFragmentRegistry,
} from "@elllphnt/elementa-core";
import { combineLatestMerged, RecordState } from "@elllphnt/elementa-utils";
import { combineLatest, Observable } from "rxjs";
import { StatefulModel } from "../../_base.js";
import { StatefulStyle } from "../stylesheet/style.js";

export class StatefulKeyframe
  extends StatefulModel<KeyFrameData>
  implements Keyframe
{
  readonly style: StatefulStyle;
  readonly fragmentRegistry: StyleFragmentRegistry;

  private _state: RecordState<Omit<KeyFrameData, "style">>;

  get offset(): number | undefined {
    return this._state.entry("offset");
  }
  get offset$(): Observable<number | undefined> {
    return this._state.entry$("offset");
  }

  get data(): KeyFrameData {
    return {
      ...this._state.record,
      style: this.style.data,
    };
  }

  get data$(): Observable<KeyFrameData> {
    return combineLatestMerged([
      this._state.record$,
      combineLatest({
        style: this.style.data$,
      }),
    ]);
  }

  constructor({
    init,
    project,
    fragmentRegistry,
  }: {
    init: KeyFrameData;
    project: Project;
    fragmentRegistry: StyleFragmentRegistry;
  }) {
    const { style, ...stateData } = init;
    super();

    this._state = new RecordState({
      init: stateData,
    });

    this.style = new StatefulStyle({
      init: style || {},
      project,
      fragmentRegistry,
    });

    this.addDisposer(() => {
      this.style.dispose();
      this._state.dispose();
    });
  }

  setOffset(offset: number | undefined): void {
    this._state.setRecord({
      ...this._state.record,
      offset,
    });
  }

  restore(data: KeyFrameData): void {
    const { style, ...stateData } = data;
    this._state.setRecord(stateData);
    this.style.restore(style || {});
  }
}
