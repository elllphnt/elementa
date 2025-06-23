#!/usr/bin/env -S npx tsx

import { readFileSync } from "fs";
import { run } from "./builder.js";

interface BuilderConfig {
  tsDir: string;
  elllDir: string;
  exportDir?: string;
}

function loadConfig(configPath: string): BuilderConfig {
  try {
    const configFile = readFileSync(configPath, "utf-8");
    return JSON.parse(configFile);
  } catch (error) {
    console.error(`❌ Failed to load config file: ${configPath}`);
    console.error(error);
    process.exit(1);
  }
}

function parseArgs(): { watch: boolean; configPath: string } {
  const args = process.argv.slice(2);
  let watch = false;
  let configPath = "./builder.config.json";

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--watch" || arg === "-w") {
      watch = true;
    } else if (arg === "--config" || arg === "-c") {
      if (i + 1 < args.length) {
        configPath = args[i + 1];
        i++; // skip next argument since it's the config path
      } else {
        console.error("❌ --config option requires a path argument");
        process.exit(1);
      }
    } else if (!arg.startsWith("-")) {
      // Treat non-flag arguments as config path
      configPath = arg;
    } else {
      console.error(`❌ Unknown option: ${arg}`);
      process.exit(1);
    }
  }

  return { watch, configPath };
}

async function main() {
  const { watch, configPath } = parseArgs();
  const config = loadConfig(configPath);

  console.log(`🚀 Starting builder with config: ${configPath}`);
  console.log(`📂 TypeScript directory: ${config.tsDir}`);
  console.log(`📂 ELLL directory: ${config.elllDir}`);
  if (config.exportDir) {
    console.log(`📂 Export directory: ${config.exportDir}`);
  }
  console.log(`👀 Watch mode: ${watch ? "enabled" : "disabled"}`);

  await run({
    tsDir: config.tsDir,
    elllDir: config.elllDir,
    exportDir: config.exportDir,
    watch,
  });
}

main().catch((error) => {
  console.error("❌ Builder failed:", error);
  process.exit(1);
});
