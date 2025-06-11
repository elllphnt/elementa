import { KeyframeSetData } from "@elllphnt/elementa-base";
import { Keyframe, KeyframeSet, Project, Style } from "@elllphnt/elementa-core";
import {
  AggregatedModelList,
  combineLatestMerged,
  RecordState,
} from "@elllphnt/elementa-utils";
import { combineLatest, Observable } from "rxjs";
import { StatefulIdentifiable } from "../../_shared/identifiable.js";
import { StatefulStyleFragmentRegistry } from "../stylesheet/_.js";
import { StatefulKeyframe } from "./keyframe.js";

export class StatefulKeyframeSet
  extends StatefulIdentifiable<KeyframeSetData>
  implements KeyframeSet
{
  readonly fragmentRegistry: StatefulStyleFragmentRegistry;

  private _state: RecordState<
    Omit<KeyframeSetData, "fragmentRegistry" | "keyframes">
  >;
  private _keyframes: AggregatedModelList<StatefulKeyframe>;

  get name(): string | undefined {
    return this._state.entry("name");
  }
  get name$(): Observable<string | undefined> {
    return this._state.entry$("name");
  }

  get keyframes(): Keyframe[] {
    return this._keyframes.state.items;
  }
  get keyframes$(): Observable<Keyframe[]> {
    return this._keyframes.state.items$;
  }

  get data(): KeyframeSetData {
    return {
      ...this._state.record,
      keyframes: this._keyframes.data,
      styleFragments: this.fragmentRegistry.data,
    };
  }

  get data$(): Observable<KeyframeSetData> {
    return combineLatestMerged([
      this._state.record$,
      combineLatest({
        keyframes: this._keyframes.data$,
        styleFragments: this.fragmentRegistry.data$,
      }),
    ]);
  }

  constructor({ init, project }: { init: KeyframeSetData; project: Project }) {
    const { styleFragments, keyframes, ...stateData } = init;
    super({ id: init.id });

    this._state = new RecordState({
      init: stateData,
    });

    this.fragmentRegistry = new StatefulStyleFragmentRegistry({
      init: styleFragments || [],
    });
    this._keyframes = new AggregatedModelList({
      init: keyframes || [],
      create: (data) =>
        new StatefulKeyframe({
          init: data,
          project,
          fragmentRegistry: this.fragmentRegistry,
        }),
      dataRef: () => 0, // always match another keyframe
      modelRef: () => 0, // always match another keyframe
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._keyframes.dispose();
    });
  }
  style: Style;

  addKeyframe(keyframe: StatefulKeyframe): void {
    this._keyframes.state.add(keyframe);
  }
  removeKeyframe(index: number): void {
    this._keyframes.state.removeAt(index);
  }

  restore(data: KeyframeSetData): void {
    const { keyframes, styleFragments, ...stateData } = data;
    this._state.setRecord(stateData);
    this._keyframes.restore(keyframes || []);
    this.fragmentRegistry.restore(styleFragments || []);
  }
}
