import { KeyFrameData } from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { Project } from "~/project/_.js";
import { StyleFragmentRegistry } from "../stylesheet/_.js";
import { Style } from "../stylesheet/style.js";

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
