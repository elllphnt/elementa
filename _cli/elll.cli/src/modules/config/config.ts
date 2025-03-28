import { Generator } from "@elllphnt/elll-transpiler";
import { build } from "esbuild";
import { rmSync } from "fs";
import inquirer from "inquirer";
import { tmpdir } from "os";
import { join } from "path";
import y from "yup";
import { fs } from "../../lib/fs.js";
import { initProject } from "../init/init.js";
import { ConfigTemplateOptions } from "./template.js";

export type Config = {
  outDir: string;
  generators?: Record<string, Generator>;
};

async function loadTsModule(path: string) {
  const outfile = join(tmpdir(), path.replace(/\//g, "_") + ".js");

  await build({
    entryPoints: [path],
    outfile,
    bundle: true,
    platform: "node",
    format: "esm",
    sourcemap: false,
    write: true,
  });

  const module = await import(`file://${outfile}`);
  rmSync(outfile, { force: true });

  return module;
}

const configSchema = y.object({
  outDir: y.string().required(),
});

export async function queryConfigTemplateOptions(): Promise<ConfigTemplateOptions> {
  let outDir: string;

  const response = await inquirer.prompt([
    {
      type: "input",
      name: "outDir",
      message: "Where should we store Elll generated files?",
      default: "elll",
      required: true,
    },
  ]);
  outDir = response.outDir as string;
  return {
    outDir,
  };
}

export async function loadConfig(path: string): Promise<Config> {
  if (!(await fs.exist(path))) {
    await initProject({ configPath: path });
  }

  const configModule = await loadTsModule(path);
  const config = configModule.default;

  if (!configSchema.isValidSync(config)) {
    throw new Error("Invalid configuration file");
  }

  return config;
}
