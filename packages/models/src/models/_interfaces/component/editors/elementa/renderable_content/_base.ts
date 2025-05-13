import { Project } from "~/infrastructure/_.js";

export interface BaseRenderableContent<T extends string> {
  type: T;
  project: Project;
}
