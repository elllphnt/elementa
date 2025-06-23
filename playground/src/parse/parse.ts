import fs from "fs";
import { globby } from "globby";
import path from "path";
import { HandlerConfig } from "./_types.js";
import { writeFile } from "./_utils.js";
import { transpileComponent } from "./handlers/component.js";
import { copyFile } from "./handlers/copy.js";
import { transpileRouter } from "./handlers/router.js";

const handlers: HandlerConfig[] = [
  {
    test: (path) => path.endsWith(".component.tsx"),
    handle: transpileComponent,
  },
  {
    test: (path) => {
      const fileName = path.split("/").pop() || "";
      return fileName === "router.json";
    },
    handle: transpileRouter,
  },
  {
    test: (path) => path.includes(".elll/"),
    handle: copyFile,
  },
  {
    test: (path) => path.endsWith(".ts") || path.endsWith(".tsx"),
    handle: copyFile,
  },
];

export async function parseAll({
  srcDir,
  outDir,
}: {
  srcDir: string;
  outDir: string;
}) {
  const files = await globby(["**/*"], {
    cwd: srcDir,
    absolute: true,
    onlyFiles: true,
    dot: true,
  });

  for (const file of files) {
    try {
      await parseFile({
        srcDir,
        outDir,
        filePath: file,
      });
    } catch (error) {
      console.error(`Error parsing file ${file}:`, error);
    }
  }
}

export async function parseFile({
  srcDir,
  outDir,
  filePath,
}: {
  srcDir: string;
  outDir: string;
  filePath: string;
}) {
  const relativePath = path.relative(srcDir, filePath);
  console.log(`→ Building: ${relativePath}`);

  const content = fs.readFileSync(filePath, "utf-8");

  // Find matching handler
  const handler = handlers.find((h) => h.test(relativePath));
  if (!handler) {
    console.warn(`No handler found for: ${relativePath}`);
    return;
  }

  const out = await handler.handle(relativePath, content, {
    srcRoot: srcDir,
    outRoot: outDir,
  });
  const outPath = path.join(outDir, out.path);
  writeFile(outPath, out.content);
}
