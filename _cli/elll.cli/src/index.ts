#!/usr/bin/env node

export * from "@elllphnt/elll-transpiler";
export type { Config } from "./modules/config/config.js";

import chalk from "chalk";
import { elll } from "./commands/elll.js";

// Run the CLI
elll.parseAsync(process.argv).catch((error) => {
  console.error(
    chalk.red(error instanceof Error ? error.message : "An error occurred."),
  );
  process.exit(1);
});
