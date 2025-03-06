import { elllEntities, parseElllUrl } from "@elllphnt/utils";
import { File } from "@elllphnt/workspace-service-client";
import { fsUtils } from "../../lib/fs.js";
import { paths } from "../../lib/paths.js";
import { Config } from "../../types/config.js";
import { getRepository } from "../api/repository.js";
import { getFileContent, getWorkspaceFile } from "../api/workspace.js";
import { readConfig } from "../config/config.js";
import { Registry } from "../registry/registry.js";

export interface SyncContext {
  config: Config;
  registry: Registry;
  readContent: (url: string) => Promise<string | undefined>;
  getOutputPath: (url: string, ext: `.${string}` | null) => Promise<string>;
}

export async function createSyncContext({
  configPath,
  registry,
  fileMap,
}: {
  configPath: string;
  registry: Registry;
  fileMap?: Record<string, File>;
}): Promise<SyncContext> {
  const config = await readConfig(configPath);
  const repository = await getRepository(config.repositoryId);

  async function readWorkspaceFileContent({ id }: { id: string }) {
    const file = fileMap?.[id];
    const registryFile = registry.get(id);
    const cachedPath = paths.cachedResource({
      configPath,
      id,
    });

    if (file?.hash && file?.hash === registryFile?.hash) {
      const content = await fsUtils.read(cachedPath);
      if (content !== undefined) {
        return content;
      } else {
        console.error(`Failed to read cached resource: ${cachedPath}`);
      }
    }

    const content = await getFileContent(id);
    if (content === undefined) {
      return "";
    }
    await fsUtils.write(cachedPath, content.data);

    return content.data;
  }
  async function resolveWorkspaceFileOutputPath({
    id,
  }: {
    id: string;
  }): Promise<string> {
    let file = fileMap?.[id];
    if (!file) {
      file = await getWorkspaceFile(id);
      if (!file) {
        throw new Error(`Failed to get file: ${id}`);
      }
    }

    const isLocal = file.workspace_id === repository.workspace_id;
    if (isLocal) {
      return paths.localWorkspaceFile({ root: config.root, path: file.path });
    } else {
      return paths.externalWorkspaceFile({
        root: config.root,
        workspaceId: file.workspace_id,
        path: file.path,
      });
    }
  }

  const context: SyncContext = {
    registry,
    config,
    readContent: async (url: string) => {
      const urlStruct = parseElllUrl(url);
      if (!urlStruct) {
        throw new Error(`Failed to parse url: ${url}`);
      }
      const { id, entity_name } = urlStruct;
      switch (entity_name) {
        case elllEntities.workspaceFile.name:
          return readWorkspaceFileContent({ id });
        default:
          throw new Error(`Cannot read content of: (${entity_name}) ${id}`);
      }
    },
    getOutputPath: async (url: string, ext: string | null) => {
      const urlStruct = parseElllUrl(url);
      if (!urlStruct) {
        throw new Error(`Failed to parse url: ${url}`);
      }
      const { id, entity_name } = urlStruct;
      let barePath: string;
      switch (entity_name) {
        case elllEntities.workspaceFile.name: {
          barePath = await resolveWorkspaceFileOutputPath({ id });
          break;
        }
        default:
          throw new Error(
            `Cannot resolve output path of: (${entity_name}) ${id}`,
          );
      }

      if (ext) {
        return `${barePath}${ext}`;
      } else {
        return barePath;
      }
    },
  };

  return context;
}
