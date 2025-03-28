import chalk from "chalk";
import { Command } from "commander";
import { getVersion } from "../lib/version.js";
import { authCommand } from "./elll/auth.js";
import { initCommand } from "./elll/init.js";
import { syncCommand } from "./elll/sync.js";
import { addCommand } from "./elll/add.js";

export const elll = new Command();

elll
  .version(getVersion())
  .description(
    `${chalk.bold("Elll CLI Tool")}\nSync local resources with a remote Elll repository`,
  );

elll.addCommand(authCommand);
elll.addCommand(initCommand);
elll.addCommand(syncCommand);
elll.addCommand(addCommand);
