import { BlueprintNodeData, genId } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-kernel";
import { Observable } from "rxjs";
import { Identifiable } from "~/models/identifiable.js";
import { Project } from "~/project/project.js";

export class BlueprintNode extends Identifiable<BlueprintNodeData> {
  constructor({
    state,
    project,
    initialized,
  }: {
    state: RecordState<BlueprintNodeData>;
    project: Project;
    initialized?: boolean;
  }) {
    super({ state, project });

    if (!initialized) {
      state.set("id", genId());
      state.set("position", { x: 0, y: 0 });
    }

    this.addDisposer(() => this.state.dispose());
  }

  get position(): { x: number; y: number } {
    return this.state.entry("position");
  }

  get position$(): Observable<{ x: number; y: number }> {
    return this.state.entry$("position");
  }

  setPosition(pos: { x: number; y: number }) {
    this.state.set("position", pos);
  }
}
