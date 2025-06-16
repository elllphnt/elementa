import { globby } from "globby";
import path from "path";
import { build } from "./build.js"; // you can implement this logic separately

const PATTERN = "sidebar-16.tsx";
const SRC_DIR = path.resolve("src");
const OUT_DIR = path.resolve("build");

async function main() {
  let files = await globby(["**/*.tsx"], { cwd: SRC_DIR, absolute: true });
  files = files.filter((f) => f.includes(PATTERN));

  for (const file of files) {
    const relativePath = path.relative(SRC_DIR, file);
    const relativeDirPath = path.dirname(relativePath);
    const fileName = path.basename(relativePath);
    const fileNameWithoutExt = fileName.split(".").slice(0, -1).join(".");
    const outputDir = path.resolve(
      OUT_DIR,
      relativeDirPath,
      fileNameWithoutExt
    );

    console.log(`→ Building: ${relativePath}`);
    await build({
      source: file,
      output: outputDir,
      basePath: OUT_DIR,
    });
  }

  console.log(`✅ Done. Built ${files.length} components.`);
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
