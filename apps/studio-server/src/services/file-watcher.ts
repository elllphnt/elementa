import chokidar from "chokidar";
import { EventEmitter } from "events";
import * as fs from "fs";
import * as nodepath from "path";

export interface FileUpdateEvent {
  action: "add" | "change" | "remove";
  projectId: string;
  id: string;
  resource: "file";
}
export interface DirectoryUpdateEvent {
  action: "add" | "change" | "remove";
  projectId: string;
  path: string;
  resource: "directory";
}
export interface ProjectUpdateEvent {
  action: "add" | "change" | "remove";
  id: string;
  resource: "project";
}

export type FileWatcherEventMap = {
  file: FileUpdateEvent[];
  directory: DirectoryUpdateEvent[];
  project: ProjectUpdateEvent[];
};
export class FileWatcherService extends EventEmitter<FileWatcherEventMap> {
  private rootPath: string;

  constructor(rootPath: string) {
    super();
    this.rootPath = rootPath;
  }

  watch(): void {
    const watcher = chokidar.watch(this.rootPath, {
      persistent: true,
      ignoreInitial: true,
      ignored: /(^|[/\\])\../, // Ignore dotfiles
    });
    watcher
      .on("add", (filePath: string, stats?: fs.Stats) => {
        const relativePath = nodepath.relative(this.rootPath, filePath);
        const [projectName, ...pathPart] = relativePath.split(nodepath.sep);
        const path = pathPart.join(nodepath.sep);

        if (path) {
          const id = encodeURIComponent(path);
          const projectId = encodeURIComponent(projectName);
          if (stats?.isDirectory()) {
            this.emit("directory", {
              action: "add",
              projectId,
              path,
              resource: "directory",
            });
          } else {
            this.emit("file", {
              action: "add",
              id,
              projectId,
              resource: "file",
            });
          }
        } else {
          const id = encodeURIComponent(projectName);
          this.emit("project", {
            action: "add",
            id,
            resource: "project",
          });
        }
      })
      .on("change", (filePath: string, stats?: fs.Stats) => {
        const relativePath = nodepath.relative(this.rootPath, filePath);
        const [projectName, ...pathPart] = relativePath.split(nodepath.sep);
        const path = pathPart.join(nodepath.sep);

        if (path) {
          const id = encodeURIComponent(path);
          const projectId = encodeURIComponent(projectName);
          if (stats?.isDirectory()) {
            this.emit("directory", {
              action: "change",
              projectId,
              path,
              resource: "directory",
            });
          } else {
            this.emit("file", {
              action: "change",
              id,
              projectId,
              resource: "file",
            });
          }
        } else {
          const id = encodeURIComponent(projectName);
          this.emit("project", {
            action: "change",
            id,
            resource: "project",
          });
        }
      })
      .on("unlink", (filePath: string) => {
        const relativePath = nodepath.relative(this.rootPath, filePath);
        const [projectName, ...pathPart] = relativePath.split(nodepath.sep);
        const path = pathPart.join(nodepath.sep);

        if (path) {
          const id = encodeURIComponent(path);
          const projectId = encodeURIComponent(projectName);
          this.emit("file", {
            action: "remove",
            id,
            projectId,
            resource: "file",
          });
        } else {
          const id = encodeURIComponent(projectName);
          this.emit("project", {
            action: "remove",
            id,
            resource: "project",
          });
        }
      })
      .on("unlinkDir", (dirPath: string) => {
        const relativePath = nodepath.relative(this.rootPath, dirPath);
        const [projectName, ...pathPart] = relativePath.split(nodepath.sep);
        const path = pathPart.join(nodepath.sep);

        if (path) {
          const projectId = encodeURIComponent(projectName);
          this.emit("directory", {
            action: "remove",
            projectId,
            path,
            resource: "directory",
          });
        } else {
          const id = encodeURIComponent(projectName);
          this.emit("project", {
            action: "remove",
            id,
            resource: "project",
          });
        }
      })
      .on("error", (error: Error) => {
        console.error("File watcher error:", error);
      });
  }
}
