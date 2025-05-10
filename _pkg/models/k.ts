import fs from "fs";
import path from "path";

const directoryToProcess = path.resolve(process.argv[2] || "./src");

const tsFileExtensions = [".ts", ".tsx"];
const localImportRegex = /(import|export)\s.*?from\s+["'](.+?)["']/g;

function isLocalModule(filePath: string): boolean {
  return filePath.startsWith("./") || filePath.startsWith("../");
}

function ensureJsExtension(importPath: string): string {
  if (importPath.endsWith(".js") || importPath.endsWith(".json"))
    return importPath;
  if (/\.[tj]sx?$/.test(importPath))
    return importPath.replace(/\.[tj]sx?$/, ".js");
  return importPath + ".js";
}

function processFile(filePath: string) {
  console.log("Processing:", filePath);
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  content = content.replace(localImportRegex, (match, keyword, importPath) => {
    if (!isLocalModule(importPath)) return match;

    const newPath = ensureJsExtension(importPath);
    if (newPath !== importPath) {
      modified = true;
      return match.replace(importPath, newPath);
    }

    return match;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log("Updated:", filePath);
  }
}

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (
      tsFileExtensions.includes(path.extname(fullPath)) &&
      !fullPath.endsWith(".d.ts")
    ) {
      processFile(fullPath);
    }
  }
}

console.log("Scanning:", directoryToProcess);
walkDir(directoryToProcess);
console.log("Done.");
