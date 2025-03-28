import { Command } from "commander";
import { paths } from "../../lib/paths.js";
import { add } from "../../routines/add.js";

export const addCommand = new Command("add")
  .description("install an elll repository snapshot into the current project")
  .argument("<ref>", "reference to the repository snapshot")
  .option("-c, --config <path>", "path to the Elll configuration file")
  .option("-f, --force", "force sync up-to-date resources")
  .action(async (ref, options: { config?: string; force?: boolean }) => {
    await add({
      reference: ref,
      configPath: options.config ?? paths.config({ directory: "." }),
      force: options.force,
    });
  });
