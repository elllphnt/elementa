import type { State } from "@elllphnt/elementa-kernel";
import { Model } from "@elllphnt/elementa-kernel";
import type { Project } from "~/project/project.js";

export class ProjectModel<S extends State> extends Model<S> {
  readonly project: Project;

  constructor({
    state,
    project,
    initialized,
  }: {
    state: S;
    project: Project;
    initialized?: boolean;
  }) {
    super({ state });
    this.project = project;
  }
}
