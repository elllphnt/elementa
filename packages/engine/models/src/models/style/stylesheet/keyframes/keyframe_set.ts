import type {
  KeyFrameGroupData,
  KeyframeSetData,
} from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { AggregatedModelList } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import { Identifiable } from "~/models/identifiable.js";
import type { Project } from "~/project/project.js";
import { StyleFragmentRegistry } from "../style_fragment_registry.js";
import { KeyframeGroup } from "./keyframe.js";

export class KeyframeSet extends Identifiable<KeyframeSetData> {
  readonly fragmentRegistry: StyleFragmentRegistry;

  private _groups: AggregatedModelList<
    RecordState<KeyFrameGroupData>,
    KeyframeGroup
  >;

  get name(): string | undefined {
    return this.state.entry("name");
  }
  get name$(): Observable<string | undefined> {
    return this.state.entry$("name");
  }

  get groups(): KeyframeGroup[] {
    return this._groups.models;
  }
  get groups$(): Observable<KeyframeGroup[]> {
    return this._groups.models$;
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

    this._groups = new AggregatedModelList({
      state: state.getListOfRecordStates("groups"),
      create: (state) =>
        new KeyframeGroup({
          state,
          project,
          fragmentRegistry: this.fragmentRegistry,
        }),
    });

    this.addInitializer(() => {
      this.fragmentRegistry.initialize();
      this._groups.initialize();

      this.addDisposer(() => {
        this._groups.dispose();
        this.fragmentRegistry.dispose();
      });
    });
  }

  addKeyframe(keyframe: KeyframeGroup): void {
    this._groups.add(keyframe);
  }
  removeKeyframe(index: number): void {
    this._groups.state.removeAt(index);
  }
}
