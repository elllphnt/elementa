import * as fs from "fs/promises";
import * as nodepath from "path";
import type { FileSystem } from "./fs.js";

export function createLocalFileSystem(root: string): FileSystem {
  return {
    async read(path: string): Promise<string> {
      const fullPath = nodepath.join(root, path);
      return await fs.readFile(fullPath, "utf-8");
    },
    async write(path: string, content: string): Promise<string> {
      const fullPath = nodepath.join(root, path);
      await fs.mkdir(nodepath.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, "utf-8");
      return fullPath;
    },
  };
}
