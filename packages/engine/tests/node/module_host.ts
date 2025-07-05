import type { ModuleHost } from "@elllphnt/elementa-runtime";
import { mkdir, rm, writeFile } from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

function encodeUrlToFilePath(url: string): string {
  return encodeURIComponent(url);
}

export class LocalFsModuleHost implements ModuleHost {
  private writtenFiles = new Map<string, string>(); // logical url → full path on disk

  constructor(private rootDir: string) {}

  async loadScript(url: string, code: string): Promise<void> {
    const encodedPath = encodeUrlToFilePath(url);
    const fullPath = path.resolve(this.rootDir, encodedPath);
    const dir = path.dirname(fullPath);

    await mkdir(dir, { recursive: true });

    if (this.writtenFiles.has(url)) {
      await rm(fullPath, { force: true });
    }

    await writeFile(fullPath, code, "utf-8");
    this.writtenFiles.set(url, fullPath);
  }

  resolveImportUrl(url: string): string {
    const encodedPath = encodeUrlToFilePath(url);
    const fullPath =
      this.writtenFiles.get(url) || path.resolve(this.rootDir, encodedPath);
    const fileUrl = pathToFileURL(fullPath).toString();

    return fileUrl;
  }

  async clear(): Promise<void> {
    await rm(this.rootDir, { recursive: true, force: true });
    this.writtenFiles.clear();
  }
}
