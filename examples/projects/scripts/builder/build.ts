import { globby } from "globby";
import path from "path";
import { HandlerConfig } from "./_types.js";
import { copyFile } from "./handlers/copy.js";

const handlers: HandlerConfig[] = [
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
    const outputPath = path.resolve(OUT_DIR, relativePath);

    console.log(`→ Building: ${relativePath}`);

    // Find matching handler
    const handler = handlers.find((h) => h.test(file));
    if (!handler) {
      console.warn(`No handler found for: ${relativePath}`);
      continue;
    }

    await handler.handle(file, outputPath, OUT_DIR);
  }

  console.log(`✅ Done. Built ${files.length} files.`);
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
