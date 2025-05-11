import { StaticReference } from "@elllphnt/elementa-base";
import { File, Infrastructure } from "@elllphnt/elementa-models";
import { LocalFile } from "./file";
import { LocalProject } from "./project/project";

export class LocalInfra implements Infrastructure {
  private _files: Record<string, LocalFile> = {};
  private _projects: Record<string, LocalProject> = {};

  file(url: string): File {
    let file = this._files[url];
    if (!file) {
      const [projectUrl, id] = url.split(":");
      const project = this.project(projectUrl);
      file = new LocalFile({
        id,
        project,
      });
    }
    return file;
  }
  project(url: string): LocalProject {
    let project = this._projects[url];
    if (!project) {
      project = new LocalProject({
        id: url,
        infrastructure: this,
      });
    }
    return project;
  }

  async resolveStaticReference<T>(ref: StaticReference): Promise<T> {
    return ref as T;
  }
}
