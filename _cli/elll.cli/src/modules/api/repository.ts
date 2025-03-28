import {
  createRepositoryServiceClient,
  Repository,
} from "@elllphnt/repository-service-client";
import chalk from "chalk";
import { baseUrl, tokenManager } from "./_common.js";

export type BlobInfo = {
  type: string;
  path: string;
  sha: string;
};
export type FileInfo = {
  id: string;
  type: string;
  path: string;
  hash: string;
};

export const repositoryServiceClient = createRepositoryServiceClient({
  baseUrl,
  tokenManager,
});

export async function listTenantRepositories({
  tenant_id,
}: {
  tenant_id: string;
}) {
  const result = await repositoryServiceClient.get("/repositories", {
    params: {
      query: {
        tenant_id,
      },
    },
  });

  if (!result.response.ok) {
    console.error(
      chalk.red(`Failed to list repositories: ${result.response.statusText}`),
    );
    throw result.response;
  }

  return result.data as Repository[];
}

export async function getRepository(repositoryId: string) {
  const result = await repositoryServiceClient.get(
    "/repositories/{repository_id}",
    {
      params: {
        path: {
          repository_id: repositoryId,
        },
      },
    },
  );

  if (!result.response.ok) {
    console.error(
      chalk.red(`Failed to get repository: ${result.response.statusText}`),
    );
    throw result.response;
  }

  return result.data as Repository;
}

export async function getCommitRecord({ commit_id }: { commit_id: string }) {
  const result = await repositoryServiceClient.get(
    "/commits/{commit_id}/record",
    {
      params: {
        path: {
          commit_id,
        },
      },
    },
  );

  if (!result.response.ok) {
    console.error(
      chalk.red(`Failed to get commit record: ${result.response.statusText}`),
    );
    throw result.response;
  }

  return result.data as Record<string, BlobInfo>;
}

export async function getCommitFile(file_id: string) {
  const result = await repositoryServiceClient.get("/commit-files/{file_id}", {
    params: {
      path: {
        file_id,
      },
    },
  });

  if (!result.response.ok) {
    console.error(
      chalk.red(`Failed to get commit file: ${result.response.statusText}`),
    );
    throw result.response;
  }

  return result.data;
}
export async function readCommitFileContent({ file_id }: { file_id: string }) {
  const result = await repositoryServiceClient.get(
    "/commit-files/{file_id}/content",
    {
      params: {
        path: {
          file_id,
        },
      },
    },
  );

  if (!result.response.ok) {
    console.error(
      chalk.red(
        `Failed to get commit file content: ${result.response.statusText}`,
      ),
    );
    throw result.response;
  }

  return result.data!;
}
