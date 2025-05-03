import { StaticReference } from "@elllphnt/elementa-base";
import { Infrastructure } from "../infrastructure";
import { InMemoryFile } from "./file";
import { InMemoryProject } from "./project";

export class InMemoryInfrastructure implements Infrastructure {
  static makeAbsoluteFileUrl(projectId: string, fileId: string) {
    return `file:${projectId}:${fileId}`;
  }
  static makeRelativeFileUrl(fileId: string) {
    return `file:${fileId}`;
  }
  static makeProjectUrl(projectId: string) {
    return `project:${projectId}`;
  }

  private projects: Map<string, InMemoryProject> = new Map();

  file(url: string): InMemoryFile {
    const parts = url.split(":");
    if (parts[0] !== "file" || parts.length < 2) {
      throw new Error(`Invalid file url: ${url}`);
    }
    const [_, projectId, fileId] =
      parts.length === 3 ? parts : [parts[0], parts[1], parts[1]];
    const project = this.project(
      InMemoryInfrastructure.makeProjectUrl(projectId)
    ) as InMemoryProject;
    let file = project.getFile(fileId);
    if (!file) {
      file = project.addFile(fileId, { name: fileId, type: "", content: "" });
    }
    return file;
  }

  project(url: string): InMemoryProject {
    const [prefix, id] = url.split(":");
    if (prefix !== "project" || !id) {
      throw new Error(`Invalid project url: ${url}`);
    }
    let proj = this.projects.get(id);
    if (!proj) {
      proj = new InMemoryProject({ id, infrastructure: this });
      this.projects.set(id, proj);
    }
    return proj;
  }

  resolveAbsoluteUrl(
    projectUrl: string,
    relativeUrl: string
  ): string | undefined {
    const fileParts = relativeUrl.split(":");
    if (fileParts[0] === "file" && fileParts.length == 3) {
      return relativeUrl;
    }
    const [_, projectId] = projectUrl.split(":");
    const fileId = fileParts[1];
    return InMemoryInfrastructure.makeAbsoluteFileUrl(projectId, fileId);
  }

  resolveRelativeUrl(fileUrl: string): string | undefined {
    const parts = fileUrl.split(":");
    if (parts[0] !== "file") return undefined;
    const fileId = parts.length == 2 ? parts[1] : parts[2];
    return InMemoryInfrastructure.makeRelativeFileUrl(fileId);
  }

  resolveProjectUrl(fileUrl: string): string | undefined {
    const parts = fileUrl.split(":");
    if (parts[0] !== "file" || parts.length !== 3) return undefined;
    return InMemoryInfrastructure.makeProjectUrl(parts[1]);
  }

  async resolveStaticReference(ref: StaticReference): Promise<any> {
    return undefined;
  }
}
