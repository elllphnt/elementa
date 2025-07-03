import type { BlueprintNodeData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import { Identifiable } from "~/models/identifiable.js";
import type { Project } from "~/project/project.js";

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
      const newId = genId();
      const newPosition = { x: 0, y: 0 };
      state.set("id", newId);
      state.set("position", newPosition);
    }
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
