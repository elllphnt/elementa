import { elllEntities, getUrlScheme, parseEntityId } from "@elllphnt/utils";
import {
  createWorkspaceServiceClient,
  File,
  FileContent,
  Workspace,
} from "@elllphnt/workspace-service-client";
import chalk from "chalk";
import { baseUrl, tokenManager } from "./_common.js";

export const workspaceServiceClient = createWorkspaceServiceClient({
  baseUrl,
  tokenManager,
});

/**
 * Fetches a workspace file by its ID.
 * @param file_id - The ID of the file to fetch.
 * @returns A promise that resolves to the file or undefined if not found.
 * @throws An error if the request fails.
 */
export async function getWorkspaceFile(
  file_id: string,
): Promise<File | undefined> {
  const result = await workspaceServiceClient.get(
    "/workspace-files/{file_id}",
    {
      params: {
        path: {
          file_id,
        },
      },
    },
  );

  if (result.response.status === 404) {
    return undefined;
  } else if (!result.response.ok) {
    console.error(
      chalk.red(`Failed to get file ${file_id}: ${result.response.statusText}`),
    );
    throw result.response;
  }

  return result.data as File;
}

export async function listTenantWorkspaces({
  tenant_id,
}: {
  tenant_id: string;
}) {
  const result = await workspaceServiceClient.get("/workspaces", {
    params: {
      query: {
        tenant_id,
      },
    },
  });

  if (!result.response.ok) {
    console.error(
      chalk.red(`Failed to list workspaces: ${result.response.statusText}`),
    );
    throw result.response;
  }

  return result.data as Workspace[];
}

/**
 * Retrieves a file based on the provided URL.
 * @param url - The URL of the file.
 * @returns A promise that resolves to a File object or undefined if the file cannot be retrieved.
 */
export async function getFile(url: string): Promise<File | undefined> {
  const scheme = getUrlScheme(url);
  if (!scheme) {
    console.error(`Invalid URL: ${url}`);
    return undefined;
  }

  switch (scheme) {
    case "elll": {
      const id = url.slice("elll:".length);
      const idStruct = parseEntityId(id);
      if (!idStruct) {
        console.error(`Invalid entity id: ${id}`);
        return undefined;
      }
      switch (idStruct.entity_name) {
        case elllEntities.workspaceFile.name:
          return getWorkspaceFile(id);
        default:
          console.error(`Unsupported entity type: ${idStruct.entity_name}`);
          return undefined;
      }
    }
    default:
      console.log(`Unsupported URL scheme: ${scheme}`);
      return undefined;
  }
}

export async function listFiles(fileIds: string[]): Promise<File[]> {
  if (fileIds.length === 0) {
    return [];
  }

  const result = await workspaceServiceClient.get("/workspace-files", {
    params: {
      query: {
        file_ids: fileIds,
      },
    },
  });
  if (!result.response.ok) {
    console.error(
      `Failed to list files: ${result.response.statusText}`,
      result.error,
    );
    throw result.response;
  }

  return result.data as File[];
}

export async function listWorkspaceFiles({
  workspace_id,
  include,
  exclude,
  types,
}: {
  workspace_id: string;
  include?: string[];
  exclude?: string[];
  types?: string[];
}): Promise<File[]> {
  const limit = 100;
  let cursor: string | undefined = undefined;
  let hasMore = true;
  const files: File[] = [];

  while (hasMore) {
    const result = await workspaceServiceClient.get(
      "/workspaces/{workspace_id}/files",
      {
        params: {
          path: {
            workspace_id,
          },
          query: {
            limit,
            cursor,
            include: include?.join(","),
            exclude: exclude?.join(","),
            types: types?.join(","),
          } as any,
        },
      },
    );

    if (!result.response.ok) {
      console.error(
        `Failed to list workspace files: ${result.response.statusText}`,
        result.error,
      );
      throw result.response;
    }

    files.push(...(result.data as File[]));

    if (files.length < limit) {
      hasMore = false;
    } else {
      cursor = files[files.length - 1].id;
    }
  }

  return files;
}

export async function getFileContent(file_id: string) {
  const result = await workspaceServiceClient.get(
    "/workspace-files/{file_id}/content",
    {
      params: {
        path: {
          file_id,
        },
      },
    },
  );
  if (result.response.status === 404) {
    console.error(`File not found: ${file_id}`);
    return undefined;
  } else if (!result.response.ok) {
    console.error(
      `Failed to get file content ${file_id}: ${result.response.statusText}`,
    );
    throw result.response;
  }

  return result.data as FileContent;
}
