import chokidar from "chokidar";
import debouce from "lodash.debounce";
import path from "path";
import { generateApp } from "./generate/generate.js";
import { parseAll, parseFile } from "./parse/parse.js";

async function buildAll({
  tsDir,
  elllDir,
  exportDir,
}: {
  tsDir: string;
  elllDir: string;
  exportDir?: string;
}): Promise<void> {
  await parseAll({ srcDir: tsDir, outDir: elllDir });
  if (exportDir) {
    await generateApp({ srcDir: elllDir, outDir: exportDir });
  }
}

async function watchTsProject({
  tsDir,
  elllDir,
}: {
  tsDir: string;
  elllDir: string;
}): Promise<void> {
  console.log(`👀 Watching ${tsDir} for changes...`);

  const watcher = chokidar.watch(tsDir, {
    // ignored: /(^|[/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
  });

  watcher
    .on("add", async (filePath) => {
      try {
        console.log(`📁 File added: ${path.relative(tsDir, filePath)}`);
        await parseFile({
          srcDir: tsDir,
          outDir: elllDir,
          filePath,
        });
      } catch (error) {
        console.error(
          `❌ Error handling file add ${path.relative(tsDir, filePath)}:`,
          error
        );
      }
    })
    .on("change", async (filePath) => {
      try {
        console.log(`📝 File changed: ${path.relative(tsDir, filePath)}`);
        await parseFile({
          srcDir: tsDir,
          outDir: elllDir,
          filePath,
        });
      } catch (error) {
        console.error(
          `❌ Error handling file change ${path.relative(tsDir, filePath)}:`,
          error
        );
      }
    });
}

async function watchElllProject({
  elllDir,
  exportDir,
}: {
  elllDir: string;
  exportDir?: string;
}): Promise<void> {
  console.log(`👀 Watching ${elllDir} for changes...`);

  const watcher = chokidar.watch(elllDir, {
    // ignored: /(^|[/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
  });

  const run = debouce(async () => {
    try {
      await generateApp({ srcDir: elllDir, outDir: exportDir || "" });
    } catch (error) {
      console.error("❌ Error generating app:", error);
    }
  }, 1000);

  watcher
    .on("add", async (filePath) => {
      try {
        console.log(`📁 File added: ${path.relative(elllDir, filePath)}`);
        run();
      } catch (error) {
        console.error(
          `❌ Error handling file add ${path.relative(elllDir, filePath)}:`,
          error
        );
      }
    })
    .on("change", async (filePath) => {
      try {
        console.log(`📝 File changed: ${path.relative(elllDir, filePath)}`);
        run();
      } catch (error) {
        console.error(
          `❌ Error handling file change ${path.relative(elllDir, filePath)}:`,
          error
        );
      }
    });
}

export async function run({
  tsDir,
  elllDir,
  exportDir,
  watch,
}: {
  tsDir: string;
  elllDir: string;
  exportDir?: string;
  watch?: boolean;
}) {
  try {
    await buildAll({ tsDir, elllDir, exportDir });
  } catch (error) {
    console.error("❌ Error during initial build:", error);
  }
  if (watch) {
    await watchTsProject({ tsDir, elllDir });
    if (exportDir) {
      await watchElllProject({ elllDir, exportDir });
    }
  }
}
