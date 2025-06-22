import {
  ensureField,
  getOrCreateYArray,
  getOrCreateYMap,
} from "@elllphnt/crdt";
import { KeyframeSetData } from "@elllphnt/elementa-base";
import { Keyframe, KeyframeSet, Project, Style } from "@elllphnt/elementa-core";
import {
  AggregatedCrdtModelList,
  CrdtModel,
  CrdtRecordState,
  keyManager,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { CrdtStyleFragmentRegistry } from "../stylesheet/style_fragment_registry.js";
import { CrdtKeyframe } from "./keyframe.js";

export class CrdtKeyframeSet
  extends CrdtModel<y.Map<any>>
  implements KeyframeSet
{
  readonly fragmentRegistry: CrdtStyleFragmentRegistry;

  private _state: CrdtRecordState<
    Omit<KeyframeSetData, "fragmentRegistry" | "keyframes" | "styleFragments">
  >;
  private _keyframes: AggregatedCrdtModelList<CrdtKeyframe>;

  get id(): string {
    return this._state.entry("id") || "";
  }

  get name(): string | undefined {
    return this._state.entry("name");
  }

  get name$(): Observable<string | undefined> {
    return this._state.entry$("name");
  }

  get keyframes(): Keyframe[] {
    return this._keyframes.models;
  }

  get keyframes$(): Observable<Keyframe[]> {
    return this._keyframes.models$;
  }

  constructor({
    crdt,
    project,
    initialized,
  }: {
    crdt: y.Map<any>;
    project: Project;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("keyframe-set"), crdt });

    if (!initialized) {
      ensureField(crdt, "id", () =>
        Math.random().toString(36).substring(2, 10)
      );
      ensureField(crdt, "styleFragments", () => new y.Map());
      ensureField(crdt, "keyframes", () => new y.Array());
    }

    this._state = new CrdtRecordState(crdt);

    this.fragmentRegistry = new CrdtStyleFragmentRegistry({
      crdt: getOrCreateYMap(crdt, "styleFragments"),
      initialized,
    });

    this._keyframes = new AggregatedCrdtModelList({
      crdt: getOrCreateYArray<y.Map<any>>(crdt, "keyframes"),
      create: (crdt, init) =>
        new CrdtKeyframe({
          crdt,
          project,
          fragmentRegistry: this.fragmentRegistry,
          initialized: init && initialized,
        }),
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._keyframes.dispose();
      this.fragmentRegistry.dispose();
    });
  }

  style: Style;

  addKeyframe(keyframe: Keyframe): void {
    const map = new y.Map();
    const crdtKeyframe = new CrdtKeyframe({
      crdt: map,
      project: this.style?.project || ({} as Project),
      fragmentRegistry: this.fragmentRegistry,
      initialized: true,
    });
    if (keyframe.offset !== undefined) {
      crdtKeyframe.setOffset(keyframe.offset);
    }
    this._keyframes.add([crdtKeyframe]);
  }

  removeKeyframe(index: number): void {
    this._keyframes.state.removeAt(index);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtKeyframeSet({
      crdt,
      project: this.style?.project || ({} as Project),
      initialized: true,
    }) as this;
  }
}
