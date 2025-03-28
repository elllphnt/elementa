import { FileSystem } from "@elllphnt/elll-transpiler";
import * as nodeFs from "fs";
import * as path from "path";

export const fs: FileSystem = {
  write: async function (filePath: string, data: string): Promise<void> {
    await nodeFs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await nodeFs.promises.writeFile(filePath, data);
  },
  read: async function (filePath: string): Promise<string> {
    try {
      return await nodeFs.promises.readFile(filePath, { encoding: "utf-8" });
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        return "";
      }
      throw error;
    }
  },
  remove: async function (filePath: string): Promise<void> {
    try {
      await nodeFs.promises.unlink(filePath);
    } catch (error) {
      if ((error as any).code !== "ENOENT") {
        throw error;
      }
    }
  },
  exist: async function (filePath: string): Promise<boolean> {
    try {
      await nodeFs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  },
};
