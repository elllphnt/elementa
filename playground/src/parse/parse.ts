import fs from "fs";
import { globby } from "globby";
import path from "path";
import { IncrementalCache } from "./_cache.js";
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
  incremental = true,
}: {
  srcDir: string;
  outDir: string;
  incremental?: boolean;
}) {
  const cache = new IncrementalCache(outDir);

  const files = await globby(["**/*"], {
    cwd: srcDir,
    absolute: true,
    onlyFiles: true,
    dot: true,
  });

  let parsedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    try {
      const parsed = await parseFile({
        srcDir,
        outDir,
        filePath: file,
        cache: incremental ? cache : undefined,
      });

      if (parsed) {
        parsedCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      console.error(`Error parsing file ${file}:`, error);
    }
  }

  if (incremental) {
    console.log(
      `📊 Build summary: ${parsedCount} files parsed, ${skippedCount} files skipped (unchanged)`
    );
    const stats = cache.getStats();
    console.log(`📋 Cache: ${stats.totalFiles} files tracked`);
  }
}

export async function parseFile({
  srcDir,
  outDir,
  filePath,
  cache,
}: {
  srcDir: string;
  outDir: string;
  filePath: string;
  cache?: IncrementalCache;
}): Promise<boolean> {
  console.log(`🔍 Parsing file: ${filePath}`);
  console.log(`📂 Source directory: ${srcDir}`);
  console.log(`📁 Output directory: ${outDir}`);
  const relativePath = path.relative(srcDir, filePath);

  // Find matching handler
  const handler = handlers.find((h) => h.test(relativePath));
  if (!handler) {
    return false;
  }

  // Check if incremental build should skip this file
  if (cache && !cache.shouldRebuild(filePath)) {
    // console.log(`⏭️  Skipping: ${relativePath} (unchanged)`);
    return false;
  }

  console.log(`→ Building: ${relativePath}`);

  const content = fs.readFileSync(filePath, "utf-8");

  const out = await handler.handle(relativePath, content, {
    srcRoot: srcDir,
    outRoot: outDir,
  });

  writeFile(path.join(outDir, out.path), out.content);

  // Update cache after successful build
  if (cache) {
    cache.updateCache(filePath);
  }

  return true;
}

/**
 * Clear the build cache for a specific output directory
 */
export async function clearCache(outDir: string): Promise<void> {
  const cache = new IncrementalCache(outDir);
  cache.clearCache();
  console.log(`🗑️  Cleared build cache for ${outDir}`);
}

/**
 * Force rebuild all files (ignoring cache)
 */
export async function parseAllForce({
  srcDir,
  outDir,
}: {
  srcDir: string;
  outDir: string;
}) {
  return parseAll({ srcDir, outDir, incremental: false });
}
