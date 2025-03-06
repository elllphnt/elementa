import {
  createRepositoryServiceClient,
  Repository,
} from "@elllphnt/repository-service-client";
import chalk from "chalk";
import { baseUrl, tokenManager } from "./_common.js";

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
