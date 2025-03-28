import { Command } from "commander";

export const syncCommand = new Command("sync")
  .description("sync resources from a remote Elll workspace")
  .option("-c, --config <path>", "path to the Elll configuration file")
  .option("-f, --force", "force sync up-to-date resources")
  .action(async (options: { config?: string; force?: boolean }) => {
    // await sync({
    //   configPath: options.config ?? paths.config({ directory: "." }),
    //   force: options.force,
    // });
  });
