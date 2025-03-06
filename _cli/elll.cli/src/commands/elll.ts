import chalk from "chalk";
import { Command } from "commander";
import { getVersion } from "../lib/version.js";
import { authCommand } from "./elll/auth.js";
import { initCommand } from "./elll/init.js";
import { syncCommand } from "./elll/sync.js";

export const elll = new Command();

const version = getVersion();
if (!version) {
  console.error("Could not determine the version of the Elll CLI Tool");
  process.exit(1);
}

elll
  .version(version)
  .description(
    `${chalk.bold("Elll CLI Tool")}\nSync local resources with a remote Elll repository`,
  );

elll.addCommand(authCommand);
elll.addCommand(initCommand);
elll.addCommand(syncCommand);
