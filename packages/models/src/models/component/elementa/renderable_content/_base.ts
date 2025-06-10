import { Project } from "~/project/_.js";

export interface BaseRenderableContent<T extends string> {
  type: T;
  project: Project;
}
