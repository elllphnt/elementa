import {
  Cache,
  File,
  GenerationContext,
  syncResource,
} from "@elllphnt/elll-transpiler";
import {
  elllFileTypes,
  getUrlScheme,
  makeFileId,
  parseEntityId,
} from "@elllphnt/utils";
import chalk from "chalk";
import { fs } from "../lib/fs.js";
import {
  getCommitFile,
  getCommitRecord,
  readCommitFileContent,
} from "../modules/api/repository.js";
import { Config } from "../modules/config/config.js";

const resourceTypes = new Set([
  elllFileTypes.component,
  elllFileTypes.primitive,
  elllFileTypes.state,
  elllFileTypes.context,
]);

export async function syncRepository({
  commitId,
  cache,
  config,
  force,
}: {
  commitId: string;
  cache: Cache;
  config: Config;
  force?: boolean;
}) {
  const idStruct = parseEntityId(commitId);
  if (!idStruct) {
    throw new Error(`Invalid commit id: ${commitId}`);
  }
  const record = await getCommitRecord({
    commit_id: commitId,
  });

  const context = createGenerationContext({ cache, config, driveId: commitId });

  const updatedFiles: string[] = [];
  const skippedFiles: string[] = [];
  const failedFiles: string[] = [];

  for (const [key, file] of Object.entries(record)) {
    if (!resourceTypes.has(file.type)) {
      continue;
    }

    try {
      const fileId = makeFileId({
        entity: "commit_file",
        bare_drive_id: idStruct.bare_id,
        bare_file_id: key,
      });

      if (!fileId) {
        throw new Error(`Failed to create file id for ${key}`);
      }

      const updated = await syncResource({
        file: {
          id: fileId,
          type: file.type,
          path: file.path,
          hash: file.sha,
        },
        context,
        force,
      });

      if (updated) {
        updatedFiles.push(key);
        console.log(
          `${chalk.green("✔")} Updated (${file.type}) ${file.path}.`,
        );
      } else {
        skippedFiles.push(key);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      console.error(
        `${chalk.red("✖")} Failed to update (${file.type}) ${file.path}: ${message}`,
      );
      failedFiles.push(key);
    }
  }

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

function createGenerationContext({
  config,
  cache,
  driveId,
}: {
  config: Config;
  cache: Cache;
  driveId: string;
}): GenerationContext {
  return {
    fs,
    generators: config.generators || {},
    cache,
    paths: {
      outDir: config.outDir,
    },
    readFileContent,
    resolveFile: (url: string) => resolveFile(url, driveId),
  };
}

export async function getFile(id: string): Promise<File | undefined> {
  const idStuct = parseEntityId(id);
  if (!idStuct) {
    throw new Error(`Invalid resource id: ${id}`);
  }

  switch (idStuct.entity_name) {
    case "commit_file": {
      const file = await getCommitFile(id);
      if (!file) return undefined;

      return {
        id,
        type: file.type,
        path: file.path,
        hash: file.sha,
      };
    }
    default: {
      throw new Error(`Cannot get file ${idStuct.entity_name}`);
    }
  }
}
export async function readFileContent(id: string): Promise<string> {
  const idStuct = parseEntityId(id);
  if (!idStuct) {
    throw new Error(`Invalid resource id: ${id}`);
  }

  switch (idStuct.entity_name) {
    case "commit_file": {
      return await readCommitFileContent({ file_id: id });
    }
    default: {
      throw new Error(`Cannot read content of ${idStuct.entity_name}`);
    }
  }
}

function getFileIdFromLocalUrl(url: string, driveId: string): string {
  const bareId = url.slice("local:".length);
  const driveIdStruct = parseEntityId(driveId);
  if (!driveIdStruct) {
    throw new Error(`Invalid drive id: ${driveId}`);
  }

  switch (driveIdStruct.entity_name) {
    case "commit": {
      return makeFileId({
        entity: "commit_file",
        bare_drive_id: driveIdStruct.bare_id,
        bare_file_id: bareId,
      })!;
    }
    default: {
      throw new Error(`Cannot create file id for ${driveIdStruct.entity_name}`);
    }
  }
}

export async function resolveFile(
  url: string,
  driveId: string,
): Promise<File | undefined> {
  const scheme = getUrlScheme(url);
  switch (scheme) {
    case "local": {
      const fileId = getFileIdFromLocalUrl(url, driveId);
      return getFile(fileId);
    }
  }
}
