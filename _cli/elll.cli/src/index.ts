#!/usr/bin/env node

import { elllFileTypes } from "@elllphnt/utils";
import chalk from "chalk";
import { elll } from "./commands/elll.js";
import { registerSyncer } from "./modules/sync/syncer.js";
import { elllComponentSyncer } from "./modules/syncers/component_elll.js";
import { reactComponentSyncer } from "./modules/syncers/component_react.js";
import { stateSyncer } from "./modules/syncers/state.js";

// Register syncers
registerSyncer(elllFileTypes.components.elll, elllComponentSyncer);
registerSyncer(elllFileTypes.components.react, reactComponentSyncer);
registerSyncer(elllFileTypes.state, stateSyncer);

// Run the CLI
elll.parseAsync(process.argv).catch((error) => {
  console.error(
    chalk.red(error instanceof Error ? error.message : "An error occurred."),
  );
  process.exit(1);
});
