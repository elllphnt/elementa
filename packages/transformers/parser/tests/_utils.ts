import fs from "fs";

export function readFixture(fileName: string): string {
  const filePath = `tests/fixtures/${fileName}`;
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fixture file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf-8");
}
export function writeFile(path: string, content: string): void {
  const dir = path.substring(0, path.lastIndexOf("/"));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path, content, "utf-8");
}
