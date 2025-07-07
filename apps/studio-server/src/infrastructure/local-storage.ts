import { replaceReferences } from "@elllphnt/elementa-parser";
import * as fsSync from "fs";
import * as fs from "fs/promises";
import nodepath, * as path from "path";
import type { FileData, Infrastructure, ProjectData } from "../types";

export const getFileTypeFromPath = (filePath: string) => {
  const fileName = path.basename(filePath);
  if (fileName === "router.json") {
    return "router";
  } else if (filePath.endsWith(".component.json")) {
    return "component";
  } else if (filePath.endsWith(".hook.ts")) {
    return "hook";
  } else if (filePath.endsWith(".context.ts")) {
    return "context";
  } else if (filePath.endsWith(".loader.ts")) {
    return "loader";
  } else if (filePath.endsWith(".handler.ts")) {
    return "handler";
  } else if (filePath.endsWith(".script.ts")) {
    return "script";
  } else if (filePath.endsWith(".md")) {
    return "markdown";
  } else if (filePath.endsWith(".json")) {
    return "json";
  } else if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
    return "script";
  } else {
    return "text";
  }
};

export class LocalStorageInfrastructure implements Infrastructure {
  private rootPath: string;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
  }

  getRootPath(): string {
    return this.rootPath;
  }

  async getProjects(): Promise<ProjectData[]> {
    try {
      const entries = await fs.readdir(this.rootPath, { withFileTypes: true });
      const projects: ProjectData[] = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          projects.push({
            id: encodeURIComponent(entry.name),
            name: entry.name,
          });
        }
      }

      return projects;
    } catch (error) {
      console.error("Error reading projects:", error);
      return [];
    }
  }

  async getProject(projectId: string): Promise<ProjectData | null> {
    try {
      const projectName = decodeURIComponent(projectId);
      const projectPath = path.join(this.rootPath, projectName);

      const stat = await fs.stat(projectPath);
      if (stat.isDirectory()) {
        return {
          id: projectId,
          name: projectName,
        };
      }

      return null;
    } catch (error) {
      console.error("Error getting project:", error);
      return null;
    }
  }

  async getFile(projectId: string, fileId: string): Promise<FileData | null> {
    try {
      const projectName = decodeURIComponent(projectId);
      const filePath = decodeURIComponent(fileId);
      const fullPath = path.join(this.rootPath, projectName, filePath);

      const stat = await fs.stat(fullPath);
      if (stat.isFile()) {
        return {
          id: encodeURIComponent(filePath),
          path: filePath,
          type: getFileTypeFromPath(filePath),
        };
      }

      return null;
    } catch (error) {
      console.error("Error getting file:", error);
      return null;
    }
  }

  async getFileContent(
    projectId: string,
    fileId: string
  ): Promise<string | null> {
    try {
      const projectName = decodeURIComponent(projectId);
      const projectDir = path.join(this.rootPath, projectName);
      const filePath = decodeURIComponent(fileId);
      const fullPath = path.join(this.rootPath, projectName, filePath);
      const content = await fs.readFile(fullPath, "utf-8");
      const dirPath = path.dirname(fullPath);

      const updatedContent = await replaceReferences(content, (ref) => {
        let path: string;
        if (ref.startsWith(".")) {
          path = nodepath.resolve(dirPath, ref);
        } else if (ref.startsWith("~/")) {
          path = nodepath.resolve(projectDir, ref.slice(2));
        } else {
          // package reference
          return ref;
        }

        if (path.endsWith(".js")) {
          path = path.slice(0, -3); // Remove .js extension
        } else if (path.endsWith(".ts")) {
          path = path.slice(0, -3); // Remove .ts extension
        } else if (path.endsWith(".tsx")) {
          path = path.slice(0, -4); // Remove .tsx extension
        } else if (path.endsWith(".jsx")) {
          path = path.slice(0, -4); // Remove .jsx extension
        }

        let filePath: string | undefined;
        for (const ext of ["", ".json", ".ts", ".tsx", ".js", ".jsx"]) {
          const candidatePath = path + ext;
          if (fsSync.existsSync(path + ext)) {
            filePath = candidatePath;
            break;
          }
        }

        if (!filePath) {
          console.error(`File not found for reference: ${ref}`, {
            ref,
            projectDir,
            dirPath,
            fullPath,
          });
          throw new Error(`Failed to resolve reference: ${ref}`);
        }

        const relativePath = nodepath.relative(projectDir, filePath);
        return `file:${encodeURIComponent(projectName)}/${encodeURIComponent(
          relativePath
        )}`;
      });

      return updatedContent;
    } catch (error) {
      console.error("Error getting file content:", error);
      return null;
    }
  }

  async getFileByPath(
    projectId: string,
    filePath: string
  ): Promise<FileData | null> {
    try {
      const projectName = decodeURIComponent(projectId);
      const fullPath = path.join(this.rootPath, projectName, filePath);

      const stat = await fs.stat(fullPath);
      if (stat.isFile()) {
        return {
          id: encodeURIComponent(filePath),
          path: filePath,
          type: getFileTypeFromPath(filePath),
        };
      }

      return null;
    } catch (error) {
      console.error("Error getting file by path:", error);
      return null;
    }
  }

  async getFiles(
    projectId: string,
    pathPrefix?: string,
    depth?: number
  ): Promise<FileData[]> {
    try {
      const projectName = decodeURIComponent(projectId);
      const projectPath = path.join(this.rootPath, projectName);

      // Verify project exists
      const projectStat = await fs.stat(projectPath);
      if (!projectStat.isDirectory()) {
        return [];
      }

      const files: FileData[] = [];

      // If pathPrefix is provided, start from that subdirectory
      const startPath = pathPrefix
        ? path.join(projectPath, pathPrefix)
        : projectPath;

      // Check if the start path exists
      try {
        const startStat = await fs.stat(startPath);
        if (!startStat.isDirectory()) {
          return [];
        }
      } catch {
        return [];
      }

      await this.collectFiles(
        startPath,
        projectPath,
        pathPrefix || "",
        depth,
        files
      );

      return files;
    } catch (error) {
      console.error("Error getting files:", error);
      return [];
    }
  }

  private async collectFiles(
    currentPath: string,
    projectPath: string,
    pathPrefix: string,
    depth: number | undefined,
    files: FileData[],
    currentDepth: number = 0
  ): Promise<void> {
    // If depth is specified and we've reached it, stop recursing
    if (depth !== undefined && currentDepth >= depth) {
      return;
    }

    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = path.join(currentPath, entry.name);
        const relativePath = path.relative(projectPath, entryPath);

        if (entry.isFile()) {
          files.push({
            id: encodeURIComponent(relativePath),
            path: relativePath,
            type: getFileTypeFromPath(relativePath),
          });
        } else if (entry.isDirectory()) {
          // Recursively collect files from subdirectories
          await this.collectFiles(
            entryPath,
            projectPath,
            pathPrefix,
            depth,
            files,
            currentDepth + 1
          );
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${currentPath}:`, error);
    }
  }
}
