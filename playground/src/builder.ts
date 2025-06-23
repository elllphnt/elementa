import chokidar from "chokidar";
import fs from "fs/promises";
import debouce from "lodash.debounce";
import path from "path";
import { generateApp } from "./generate/generate.js";
import { parseAll, parseFile, clearCache } from "./parse/parse.js";

async function buildProject({
  name,
  projectsDir,
  infraDir,
  appsDir,
  incremental = true,
}: {
  name: string;
  projectsDir: string;
  infraDir: string;
  appsDir?: string;
  incremental?: boolean;
}): Promise<void> {
  await parseAll({
    srcDir: path.join(projectsDir, name),
    outDir: path.join(infraDir, name),
    incremental,
  });
  if (appsDir) {
    // only generate app if .elll/app file exists
    const appFilePath = path.join(infraDir, name, ".elll", "app");
    const appFileExists = await fs
      .access(appFilePath)
      .then(() => true)
      .catch(() => false);
    if (appFileExists) {
      console.log(`📂 Generating app for ${name}...`);
      await generateApp({
        srcDir: path.join(infraDir, name),
        outDir: path.join(appsDir, name),
      });
    } else {
      console.log(`📂 No app file found for ${name}, skipping app generation.`);
    }
  }
}

async function buildAllProjects({
  projectsDir,
  infraDir,
  appsDir,
  filter,
  incremental = true,
}: {
  projectsDir: string;
  infraDir: string;
  appsDir?: string;
  filter?: (projectName: string) => boolean;
  incremental?: boolean;
}): Promise<void> {
  const projects = await fs.readdir(projectsDir, { withFileTypes: true });
  for (const project of projects) {
    if (project.isDirectory()) {
      const projectName = project.name;

      // Apply filter if provided
      if (filter && !filter(projectName)) {
        console.log(`⏭️  Skipping project: ${projectName} (filtered out)`);
        continue;
      }

      console.log(`🔧 Building project: ${projectName}`);
      await buildProject({
        name: projectName,
        projectsDir,
        infraDir,
        appsDir,
        incremental,
      });
    }
  }
}

async function watchProjects({
  projectsDir,
  infraDir,
}: {
  projectsDir: string;
  infraDir: string;
}): Promise<void> {
  console.log(`👀 Watching ${projectsDir} for changes...`);

  const watcher = chokidar.watch(projectsDir, {
    persistent: true,
    ignoreInitial: true,
  });

  function splitPath(
    relativePath: string
  ): [projectName: string, path: string] {
    const parts = relativePath.split(path.sep);
    if (parts.length < 2) {
      throw new Error(`Invalid file path: ${relativePath}`);
    }
    return [parts[0], parts.slice(1).join(path.sep)];
  }

  watcher
    .on("add", async (filePath) => {
      const [projectName, relativePath] = splitPath(
        path.relative(projectsDir, filePath)
      );
      try {
        console.log(`📁 File added in ${projectName}: ${relativePath}`);
        await parseFile({
          srcDir: path.join(projectsDir, projectName),
          outDir: path.join(infraDir, projectName),
          filePath,
          // Don't use cache for watch mode - always rebuild changed files
        });
      } catch (error) {
        console.error(
          `❌ Error handling file add in ${projectName} ${relativePath}:`,
          error
        );
      }
    })
    .on("change", async (filePath) => {
      console.log(`📂 File change: ${filePath}`, {
        projectsDir,
        filePath,
        relativePath: path.relative(projectsDir, filePath),
      });

      const [projectName, relativePath] = splitPath(
        path.relative(projectsDir, filePath)
      );
      try {
        console.log(`📝 File changed in ${projectName}: ${relativePath}`);
        await parseFile({
          srcDir: path.join(projectsDir, projectName),
          outDir: path.join(infraDir, projectName),
          filePath,
          // Don't use cache for watch mode - always rebuild changed files
        });
      } catch (error) {
        console.error(
          `❌ Error handling file change in ${projectName} ${relativePath}:`,
          error
        );
      }
    })
    .on("unlink", async (filePath) => {
      const [projectName, relativePath] = splitPath(
        path.relative(projectsDir, filePath)
      );
      try {
        console.log(`🗑️  File deleted in ${projectName}: ${relativePath}`);
        // Remove from cache when file is deleted
        const { IncrementalCache } = await import("./parse/_cache.js");
        const cache = new IncrementalCache(path.join(infraDir, projectName));
        cache.removeFromCache(filePath);
      } catch (error) {
        console.error(
          `❌ Error handling file deletion in ${projectName} ${relativePath}:`,
          error
        );
      }
    });
}

async function watchInfra({
  infraDir,
  appsDir,
}: {
  infraDir: string;
  appsDir: string;
}): Promise<void> {
  console.log(`👀 Watching ${infraDir} for changes...`);

  const watcher = chokidar.watch(infraDir, {
    persistent: true,
    ignoreInitial: true,
  });

  function splitPath(
    relativePath: string
  ): [projectName: string, path: string] {
    const parts = relativePath.split(path.sep);
    if (parts.length < 2) {
      throw new Error(`Invalid file path: ${relativePath}`);
    }
    return [parts[0], parts.slice(1).join(path.sep)];
  }

  const run = debouce(async (projectName) => {
    try {
      // only generate app if .elll/app file exists
      const appFilePath = path.join(infraDir, projectName, ".elll", "app");
      const appFileExists = await fs
        .access(appFilePath)
        .then(() => true)
        .catch(() => false);
      if (appFileExists) {
        await generateApp({
          srcDir: path.join(infraDir, projectName),
          outDir: path.join(appsDir, projectName),
        });
      } else {
        console.log(
          `📂 No app file found for ${projectName}, skipping app generation.`
        );
      }
    } catch (error) {
      console.error("❌ Error generating app:", error);
    }
  }, 1000);

  watcher
    .on("add", async (filePath) => {
      const [projectName] = splitPath(path.relative(infraDir, filePath));
      run(projectName);
    })
    .on("change", async (filePath) => {
      const [projectName] = splitPath(path.relative(infraDir, filePath));
      run(projectName);
    });
}

/**
 * Clear build cache for all projects
 */
export async function clearAllCaches({
  projectsDir,
  infraDir,
}: {
  projectsDir: string;
  infraDir: string;
}): Promise<void> {
  const projects = await fs.readdir(projectsDir, { withFileTypes: true });
  for (const project of projects) {
    if (project.isDirectory()) {
      const projectName = project.name;
      console.log(`🗑️  Clearing cache for project: ${projectName}`);
      await clearCache(path.join(infraDir, projectName));
    }
  }
}

export async function run({
  projectsDir,
  infraDir,
  appsDir,
  watch,
  filter,
  incremental = true,
  force = false,
}: {
  projectsDir: string;
  infraDir: string;
  appsDir?: string;
  watch?: boolean;
  filter?: (projectName: string) => boolean;
  incremental?: boolean;
  force?: boolean;
}) {
  try {
    // Clear cache if force rebuild is requested
    if (force && incremental) {
      console.log("🗑️  Force rebuild requested, clearing all caches...");
      await clearAllCaches({ projectsDir, infraDir });
    }

    await buildAllProjects({
      projectsDir,
      infraDir,
      appsDir,
      filter,
      incremental,
    });
  } catch (error) {
    console.error("❌ Error during initial build:", error);
  }
  if (watch) {
    await watchProjects({ projectsDir, infraDir });
    if (appsDir) {
      await watchInfra({ infraDir, appsDir });
    }
  }
}
