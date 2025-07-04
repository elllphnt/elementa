import type { KeyFrameData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { Model } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import type { Project } from "~/project/project.js";
import { Style } from "../stylesheet/style.js";
import type { StyleFragmentRegistry } from "../stylesheet/style_fragment_registry.js";

export class Keyframe extends Model<RecordState<KeyFrameData>> {
  readonly style: Style;

  get offset(): number | undefined {
    return this.state.entry("offset");
  }
  get offset$(): Observable<number | undefined> {
    return this.state.entry$("offset");
  }

  constructor({
    state,
    project,
    fragmentRegistry,
  }: {
    state: RecordState<KeyFrameData>;
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

  setOffset(offset: number | undefined): void {
    this.state.set("offset", offset);
  }
}
