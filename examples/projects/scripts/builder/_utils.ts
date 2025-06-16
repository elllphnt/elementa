import fs from "fs";
import { dirname } from "path";

export function writeFile(path: string, content: string): void {
  const dir = dirname(path);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path, content, "utf-8");
}
