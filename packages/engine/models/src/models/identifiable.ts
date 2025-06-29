import { genId, IdentifiableData } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-kernel";
import { Project } from "~/project/project.js";
import { ProjectModel } from "./project.js";

export abstract class Identifiable<
  D extends IdentifiableData
> extends ProjectModel<RecordState<D>> {
  get id() {
    return this.state.entry("id");
  }

  constructor({
    state,
    project,
    initialized,
  }: {
    state: RecordState<D>;
    project: Project;
    initialized?: boolean;
  }) {
    super({ state, project });

    if (!initialized) {
      this.state.set("id", genId());
    }
  }
}
