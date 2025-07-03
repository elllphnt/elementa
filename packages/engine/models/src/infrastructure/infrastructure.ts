import { parseAbsoluteFileUrl } from "@elllphnt/elementa-base";
import { Lifecycle } from "@elllphnt/elementa-kernel";
import type { Project } from "../project/project.js";

export abstract class Infrastructure extends Lifecycle {
  abstract project(id: string): Project;

  file(url: string) {
    const { projectId, fileId } = parseAbsoluteFileUrl(url);
    const project = this.project(projectId);
    return project.file(fileId);
  }

  // models

  router(url: string) {
    const { projectId, fileId } = parseAbsoluteFileUrl(url);
    const project = this.project(projectId);
    return project.router(fileId);
  }
  component(url: string) {
    const { projectId, fileId } = parseAbsoluteFileUrl(url);
    const project = this.project(projectId);
    return project.component(fileId);
  }
  stylesheet(url: string) {
    const { projectId, fileId } = parseAbsoluteFileUrl(url);
    const project = this.project(projectId);
    return project.stylesheet(fileId);
  }
}
