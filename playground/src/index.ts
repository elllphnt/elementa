#!/usr/bin/env -S npx tsx

import { readFileSync } from "fs";
import { run } from "./builder.js";

interface BuilderConfig {
  projectsDir: string;
  infraDir: string;
  appsDir?: string;
  buildEnabled?: boolean;
  filter?: {
    include?: string | string[];
    exclude?: string | string[];
    pattern?: string;
  };
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
  let configPath = "./playground.config.json";

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

function createFilter(
  filterConfig?: BuilderConfig["filter"]
): ((projectName: string) => boolean) | undefined {
  if (!filterConfig) return undefined;

  return (projectName: string): boolean => {
    // Check include patterns
    if (filterConfig.include) {
      const includePatterns = Array.isArray(filterConfig.include)
        ? filterConfig.include
        : [filterConfig.include];

      const included = includePatterns.some((pattern) => {
        if (pattern.includes("*") || pattern.includes("?")) {
          // Simple glob pattern matching
          const regexPattern = pattern.replace(/\*/g, ".*").replace(/\?/g, ".");
          return new RegExp(`^${regexPattern}$`).test(projectName);
        }
        return projectName === pattern;
      });

      if (!included) return false;
    }

    // Check exclude patterns
    if (filterConfig.exclude) {
      const excludePatterns = Array.isArray(filterConfig.exclude)
        ? filterConfig.exclude
        : [filterConfig.exclude];

      const excluded = excludePatterns.some((pattern) => {
        if (pattern.includes("*") || pattern.includes("?")) {
          // Simple glob pattern matching
          const regexPattern = pattern.replace(/\*/g, ".*").replace(/\?/g, ".");
          return new RegExp(`^${regexPattern}$`).test(projectName);
        }
        return projectName === pattern;
      });

      if (excluded) return false;
    }

    // Check regex pattern
    if (filterConfig.pattern) {
      try {
        const regex = new RegExp(filterConfig.pattern);
        if (!regex.test(projectName)) return false;
      } catch {
        console.warn(`⚠️  Invalid regex pattern: ${filterConfig.pattern}`);
        return true;
      }
    }

    return true;
  };
}

async function main() {
  const { watch, configPath } = parseArgs();
  const config = loadConfig(configPath);
  const filter = createFilter(config.filter);

  console.log(`🚀 Starting builder with config: ${configPath}`);
  console.log(`📂 Projects directory: ${config.projectsDir}`);
  console.log(`📂 Infra directory: ${config.infraDir}`);
  if (config.appsDir) {
    console.log(`📂 Apps directory: ${config.appsDir}`);
  }
  if (config.filter) {
    console.log(`🔍 Filter config: ${JSON.stringify(config.filter)}`);
  }

  run({
    projectsDir: config.projectsDir,
    infraDir: config.infraDir,
    appsDir: config.buildEnabled ? config.appsDir : undefined,
    watch,
    filter,
  });
}

main().catch((error) => {
  console.error("❌ Builder failed:", error);
  process.exit(1);
});
