#!/usr/bin/env node

import { elllFileTypes } from "@elllphnt/utils";
import chalk from "chalk";
import { elll } from "./commands/elll.js";
import { registerSyncer } from "./modules/sync/syncer.js";
import { componentSyncer } from "./modules/syncers/component.js";
import { primitveSyncer } from "./modules/syncers/primitive.js";
import { stateSyncer } from "./modules/syncers/state.js";

// Register syncers
registerSyncer(elllFileTypes.component, componentSyncer);
registerSyncer(elllFileTypes.primitive, primitveSyncer);
registerSyncer(elllFileTypes.state, stateSyncer);

// Run the CLI
elll.parseAsync(process.argv).catch((error) => {
  console.error(
    chalk.red(error instanceof Error ? error.message : "An error occurred."),
  );
  process.exit(1);
});
