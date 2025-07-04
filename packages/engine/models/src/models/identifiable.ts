import type { IdentifiableData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import type { Project } from "~/project/project.js";
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
