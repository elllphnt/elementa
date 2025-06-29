import { Model, State } from "@elllphnt/elementa-kernel";
import { Project } from "~/project/project.js";

export class ProjectModel<S extends State> extends Model<S> {
  readonly project: Project;

  constructor({ state, project }: { state: S; project: Project }) {
    super({ state });
    this.project = project;
  }
}
