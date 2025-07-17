import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";

/**
 * Utility function to write files with auto-created parent directories
 */
export function writeFile(filePath: string, content: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(filePath, content, "utf8");
}
