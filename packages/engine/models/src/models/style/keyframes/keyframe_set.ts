import { genId, KeyFrameData, KeyframeSetData } from "@elllphnt/elementa-base";
import { AggregatedModelList, RecordState } from "@elllphnt/elementa-kernel";
import { Observable } from "rxjs";
import { Project } from "~/project/project.js";
import { Identifiable } from "../../identifiable.js";
import { StyleFragmentRegistry } from "../stylesheet/style_fragment_registry.js";
import { Keyframe } from "./keyframe.js";

export class KeyframeSet extends Identifiable<KeyframeSetData> {
  readonly fragmentRegistry: StyleFragmentRegistry;

  private _keyframes: AggregatedModelList<RecordState<KeyFrameData>, Keyframe>;

  get name(): string | undefined {
    return this.state.entry("name");
  }
  get name$(): Observable<string | undefined> {
    return this.state.entry$("name");
  }

  get keyframes(): Keyframe[] {
    return this._keyframes.models;
  }
  get keyframes$(): Observable<Keyframe[]> {
    return this._keyframes.models$;
  }

  constructor({
    state,
    project,
    initialized,
  }: {
    state: RecordState<KeyframeSetData>;
    project: Project;
    initialized?: boolean;
  }) {
    super({ state, project });

    if (!initialized) {
      state.set("id", genId());
    }

    this.fragmentRegistry = new StyleFragmentRegistry<"styleFragments">({
      propertyKey: "styleFragments",
      state,
    });

    this._keyframes = new AggregatedModelList({
      state: state.getListOfRecordStates("keyframes"),
      create: (state) =>
        new Keyframe({
          state,
          project,
          fragmentRegistry: this.fragmentRegistry,
        }),
    });

    this.addInitializer(() => {
      this.fragmentRegistry.initialize();
      this._keyframes.initialize();

      this.addDisposer(() => {
        this._keyframes.dispose();
        this.fragmentRegistry.dispose();
      });
    });
  }

  addKeyframe(keyframe: Keyframe): void {
    this._keyframes.add(keyframe);
  }
  removeKeyframe(index: number): void {
    this._keyframes.state.removeAt(index);
  }
}
