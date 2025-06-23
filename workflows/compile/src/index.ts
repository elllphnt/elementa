import chokidar from "chokidar";
import fs from "fs";
import { globby } from "globby";
import path from "path";
import config from "../../../config.json" with { type: "json" };
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
    test: () => true,
    handle: copyFile,
  },
];

const PATTERN = "";
const SRC_DIR = config.source;
const OUT_DIR = config.output.elll;
const BUILD_INFO_PATH = path.resolve("buildinfo.json");

interface BuildInfo {
  [filePath: string]: {
    lastBuilt: number;
    outputPath: string;
  };
}

function loadBuildInfo(): BuildInfo {
  try {
    if (fs.existsSync(BUILD_INFO_PATH)) {
      return JSON.parse(fs.readFileSync(BUILD_INFO_PATH, "utf-8"));
    }
  } catch {
    console.warn("Could not load buildinfo.json, starting fresh");
  }
  return {};
}

function saveBuildInfo(buildInfo: BuildInfo): void {
  writeFile(BUILD_INFO_PATH, JSON.stringify(buildInfo, null, 2));
}

function shouldRebuild(filePath: string, buildInfo: BuildInfo): boolean {
  const stats = fs.statSync(filePath);
  const fileInfo = buildInfo[filePath];

  if (!fileInfo) return true;

  const outputExists = fs.existsSync(path.join(OUT_DIR, fileInfo.outputPath));
  if (!outputExists) return true;

  return stats.mtimeMs > fileInfo.lastBuilt;
}

async function buildFile(file: string, buildInfo: BuildInfo): Promise<void> {
  try {
    const relativePath = path.relative(SRC_DIR, file);
    console.log(`→ Building: ${relativePath}`);

    const content = fs.readFileSync(file, "utf-8");

    // Find matching handler
    const handler = handlers.find((h) => h.test(relativePath));
    if (!handler) {
      console.warn(`No handler found for: ${relativePath}`);
      return;
    }

    const out = await handler.handle(relativePath, content, {
      srcRoot: SRC_DIR,
      outRoot: OUT_DIR,
    });
    const outPath = path.join(OUT_DIR, out.path);
    writeFile(outPath, out.content);

    // Update build info
    buildInfo[file] = {
      lastBuilt: Date.now(),
      outputPath: out.path,
    };
  } catch (error) {
    console.error(`Error building ${file}:`, error);
  }
}

async function buildAll(): Promise<void> {
  const buildInfo = loadBuildInfo();

  let files = await globby(["**/*"], {
    cwd: SRC_DIR,
    absolute: true,
    onlyFiles: true,
  });
  if (PATTERN) {
    files = files.filter((f) => f.includes(PATTERN));
  }

  const filesToBuild = files.filter((file) => shouldRebuild(file, buildInfo));

  if (filesToBuild.length === 0) {
    console.log("✅ All files are up to date.");
    return;
  }

  for (const file of filesToBuild) {
    await buildFile(file, buildInfo);
  }

  saveBuildInfo(buildInfo);
  console.log(
    `✅ Done. Built ${filesToBuild.length} of ${files.length} files.`
  );
}

async function watch(): Promise<void> {
  console.log(`👀 Watching ${SRC_DIR} for changes...`);

  const buildInfo = loadBuildInfo();
  const watcher = chokidar.watch(SRC_DIR, {
    ignored: /(^|[/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
  });

  watcher
    .on("add", async (filePath) => {
      if (PATTERN && !filePath.includes(PATTERN)) return;
      console.log(`📁 File added: ${path.relative(SRC_DIR, filePath)}`);
      await buildFile(filePath, buildInfo);
      saveBuildInfo(buildInfo);
    })
    .on("change", async (filePath) => {
      if (PATTERN && !filePath.includes(PATTERN)) return;
      console.log(`📝 File changed: ${path.relative(SRC_DIR, filePath)}`);
      await buildFile(filePath, buildInfo);
      saveBuildInfo(buildInfo);
    })
    .on("unlink", (filePath) => {
      const relativePath = path.relative(SRC_DIR, filePath);
      console.log(`🗑️  File removed: ${relativePath}`);

      // Remove from build info and clean up output
      if (buildInfo[filePath]) {
        const outputPath = path.join(OUT_DIR, buildInfo[filePath].outputPath);
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        delete buildInfo[filePath];
        saveBuildInfo(buildInfo);
      }
    });
}

async function main() {
  await buildAll();
  await watch();
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
