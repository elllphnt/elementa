import { StaticReference } from "@elllphnt/elementa-base";
import { parseAbsoluteFileUrl } from "~/_lib/_.js";
import { Project } from "../project/project.js";

export abstract class Infrastructure {
  abstract project(id: string): Project;

  file(url: string) {
    const { projectId, fileId } = parseAbsoluteFileUrl(url);
    const project = this.project(projectId);
    return project.file(fileId);
  }
  component(url: string) {
    const { projectId, fileId } = parseAbsoluteFileUrl(url);
    const project = this.project(projectId);
    return project.component(fileId);
  }
  router(url: string) {
    const { projectId, fileId } = parseAbsoluteFileUrl(url);
    const project = this.project(projectId);
    return project.router(fileId);
  }
  stylesheet(url: string) {
    const { projectId, fileId } = parseAbsoluteFileUrl(url);
    const project = this.project(projectId);
    return project.stylesheet(fileId);
  }

  // References
  abstract resolveStaticReference<T>(ref: StaticReference): Promise<T>;
}
