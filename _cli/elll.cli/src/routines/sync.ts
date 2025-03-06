import { elllFileTypes } from "@elllphnt/utils";
import { File } from "@elllphnt/workspace-service-client";
import chalk from "chalk";
import { paths } from "../lib/paths.js";
import { getRepository } from "../modules/api/repository.js";
import { listWorkspaceFiles } from "../modules/api/workspace.js";
import { readConfig } from "../modules/config/config.js";
import { Registry } from "../modules/registry/registry.js";
import { createSyncContext } from "../modules/sync/context.js";
import { getSyncer } from "../modules/sync/syncer.js";

export async function sync({
  configPath,
  force,
}: {
  configPath: string;
  force?: boolean;
}) {
  console.log("Syncing resources...");
  const config = await readConfig(configPath);
  const registry = new Registry(paths.registry({ configPath }));
  await registry.load();

  const repository = await getRepository(config.repositoryId);

  const files = await listWorkspaceFiles({
    workspace_id: repository.workspace_id,
    types: [
      elllFileTypes.components.elll,
      elllFileTypes.components.react,
      elllFileTypes.state,
    ],
  });

  const context = await createSyncContext({
    configPath,
    registry,
    fileMap: Object.fromEntries(files.map((file) => [file.id!, file])),
  });

  const updatedFiles: File[] = [];
  const skippedFiles: File[] = [];
  const failedFiles: File[] = [];

  for (const file of files) {
    try {
      const to = file;
      const from = registry.get(file.id);
      const syncer = getSyncer(to.type);

      if (!syncer) {
        console.error(chalk.red(`No syncer found for type: ${to.type}`));
        failedFiles.push(to);
        continue;
      }

      let updated = false;
      let forceSyncContent = false;
      if (from && from.path !== to.path) {
        try {
          await syncer.updatePath({
            id: file.id,
            path: to.path,
            context,
          });
          updated = true;
        } catch (e) {
          console.error(
            `${chalk.red("✖")} Failed to update path (${file.type}) ${file.path}.`,
          );
          console.log(`The file content will be forced to sync.`);
          forceSyncContent = true;
        }
      }
      if (force || forceSyncContent || !from || from.hash !== to.hash) {
        await syncer.updateContent({
          id: file.id,
          path: to.path,
          context,
        });
        updated = true;
      }

      registry.set(file.id, {
        hash: to.hash ?? "",
        path: to.path,
        type: to.type,
      });
      if (updated) {
        updatedFiles.push(to);
        console.log(
          `${chalk.green("✔")} Updated (${file.type}) ${file.path}.`,
        );
      } else {
        skippedFiles.push(to);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      console.error(
        `${chalk.red("✖")} Failed to update (${file.type}) ${file.path}: ${message}`,
      );
      failedFiles.push(file);
    }
  }

  await registry.save();

  if (updatedFiles.length === 0 && failedFiles.length === 0) {
    console.log(`${chalk.green("✔")} All resources are up to date.`);
  } else {
    if (updatedFiles.length) {
      console.log(
        `${chalk.green("✔")} Updated ${chalk.green(updatedFiles.length)} ${updatedFiles.length === 1 ? "resource" : "resources"}.`,
      );
    }
    if (failedFiles.length) {
      console.log(
        `${chalk.red("✖")} Failed to update ${chalk.red(failedFiles.length)} ${failedFiles.length === 1 ? "resource" : "resources"}.`,
      );
    }
  }
}
