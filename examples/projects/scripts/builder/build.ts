import fs from "fs";
import { globby } from "globby";
import path from "path";
import { HandlerConfig } from "./_types.js";
import { writeFile } from "./_utils.js";
import { transpileComponent } from "./handlers/component.js";
import { copyFile } from "./handlers/copy.js";

const handlers: HandlerConfig[] = [
  {
    test: (path) => path.endsWith(".component.tsx"),
    handle: transpileComponent,
  },
  {
    test: () => true,
    handle: copyFile,
  },
];

const PATTERN = ""; // "sidebar-16.tsx";
const SRC_DIR = path.resolve("src");
const OUT_DIR = path.resolve("build");

async function main() {
  let files = await globby(["**/*"], {
    cwd: SRC_DIR,
    absolute: true,
    onlyFiles: true,
  });
  if (PATTERN) {
    files = files.filter((f) => f.includes(PATTERN));
  }

  for (const file of files) {
    const relativePath = path.relative(SRC_DIR, file);
    console.log(`→ Building: ${relativePath}`);

    const content = fs.readFileSync(file, "utf-8");

    // Find matching handler
    const handler = handlers.find((h) => h.test(file));
    if (!handler) {
      console.warn(`No handler found for: ${relativePath}`);
      continue;
    }

    const out = await handler.handle(relativePath, content);
    const outPath = path.join(OUT_DIR, out.path);
    writeFile(outPath, out.content);
  }

  console.log(`✅ Done. Built ${files.length} files.`);
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
