import type { KeyFrameGroupData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { Model } from "@elllphnt/elementa-kernel";
import { map, type Observable } from "rxjs";
import type { Project } from "~/project/project.js";
import { Style } from "../style.js";
import type { StyleFragmentRegistry } from "../style_fragment_registry.js";

export class KeyframeGroup extends Model<RecordState<KeyFrameGroupData>> {
  readonly style: Style;

  get offsets(): number[] {
    return this.state.entry("offsets") || [];
  }
  get offsets$(): Observable<number[]> {
    return this.state.entry$("offsets").pipe(map((offsets) => offsets || []));
  }

  constructor({
    state,
    project,
    fragmentRegistry,
  }: {
    state: RecordState<KeyFrameGroupData>;
    project: Project;
    fragmentRegistry: StyleFragmentRegistry;
  }) {
    super({ state });

    this.style = new Style({
      state: state.getRecordState("style"),
      project,
      fragmentRegistry,
    });

    this.addDisposer(() => {
      this.style.dispose();
    });
  }

  setOffsets(offsets: number[]): void {
    this.state.set("offsets", offsets);
  }
}
