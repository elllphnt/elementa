import chokidar from "chokidar";
import fs from "fs/promises";
import debouce from "lodash.debounce";
import path from "path";
import { generateApp } from "./generate/generate.js";
import { parseAll, parseFile } from "./parse/parse.js";

async function buildProject({
  name,
  projectsDir,
  infraDir,
  appsDir,
}: {
  name: string;
  projectsDir: string;
  infraDir: string;
  appsDir?: string;
}): Promise<void> {
  await parseAll({
    srcDir: path.join(projectsDir, name),
    outDir: path.join(infraDir, name),
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
}: {
  projectsDir: string;
  infraDir: string;
  appsDir?: string;
}): Promise<void> {
  const projects = await fs.readdir(projectsDir, { withFileTypes: true });
  for (const project of projects) {
    if (project.isDirectory()) {
      const projectName = project.name;
      console.log(`🔧 Building project: ${projectName}`);
      await buildProject({
        name: projectName,
        projectsDir,
        infraDir,
        appsDir,
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

  function splitPath(filePath: string): [projectName: string, path: string] {
    const relativePath = path.relative(projectsDir, filePath);
    const parts = relativePath.split(path.sep);
    if (parts.length < 2) {
      throw new Error(`Invalid file path: ${filePath}`);
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
        });
      } catch (error) {
        console.error(
          `❌ Error handling file add in ${projectName} ${relativePath}:`,
          error
        );
      }
    })
    .on("change", async (filePath) => {
      const [projectName, relativePath] = splitPath(
        path.relative(projectsDir, filePath)
      );
      try {
        console.log(`📝 File changed in ${projectName}: ${relativePath}`);
        await parseFile({
          srcDir: path.join(projectsDir, projectName),
          outDir: path.join(infraDir, projectName),
          filePath,
        });
      } catch (error) {
        console.error(
          `❌ Error handling file change in ${projectName} ${relativePath}:`,
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

  function splitPath(filePath: string): [projectName: string, path: string] {
    const relativePath = path.relative(infraDir, filePath);
    const parts = relativePath.split(path.sep);
    if (parts.length < 2) {
      throw new Error(`Invalid file path: ${filePath}`);
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

export async function run({
  projectsDir,
  infraDir,
  appsDir,
  watch,
}: {
  projectsDir: string;
  infraDir: string;
  appsDir?: string;
  watch?: boolean;
}) {
  try {
    await buildAllProjects({
      projectsDir,
      infraDir,
      appsDir,
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
