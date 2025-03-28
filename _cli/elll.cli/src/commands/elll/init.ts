import { Command } from "commander";

export const initCommand = new Command("init")
  .description("initialize Elll")
  .argument("[repositoryId]", "Elll repository to connect to")
  .argument("[root]", "root directory to initialize Elll in")
  .action((repositoryId, root) => {
    // init({ repositoryId, root: root ?? "." });
  });
