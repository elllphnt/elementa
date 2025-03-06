import * as fs from "fs";
import * as path from "path";

export async function write(
  filePath: string,
  data: string,
  encoding: BufferEncoding = "utf8",
): Promise<void> {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(filePath, data, { encoding });
}

export async function read(
  filePath: string,
  encoding: BufferEncoding = "utf8",
): Promise<string | undefined> {
  try {
    return await fs.promises.readFile(filePath, { encoding });
  } catch (error) {
    if ((error as any).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

export async function remove(filePath: string): Promise<void> {
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if ((error as any).code !== "ENOENT") {
      throw error;
    }
  }
}

export async function exist(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function move(from: string, to: string): Promise<void> {
  await fs.promises.rename(from, to);
}

export const fsUtils = {
  write,
  read,
  remove,
  exist,
  move,
};
