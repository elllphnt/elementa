import { createConfigurationServiceClient } from "@elllphnt/configuration-service-client";
import { TokenManager } from "@elllphnt/elll-client";
import { createIdentityServiceClient } from "@elllphnt/identity-service-client";
import { createIntelligenceServiceClient } from "@elllphnt/intelligence-service-client";
import { createRepositoryServiceClient } from "@elllphnt/repository-service-client";
import { createWorkspaceServiceClient } from "@elllphnt/workspace-service-client";
import { createDriveServiceClient } from "@elllphnt/drive-service-client";
import { ClientFactory } from "./lib/client";
import { createFactory } from "./lib/factory";

function createElllephantApiClientFactory<T>(
  createClient: ({
    baseUrl,
    tokenManager,
  }: {
    baseUrl?: string | undefined;
    tokenManager: TokenManager;
  }) => T,
  { name }: { name: string },
): ClientFactory<T> {
  return createFactory(
    ({ backend }) => {
      const tokenManager = backend.getProperty("elllephantApiTokenManager");
      const baseUrl = backend.getProperty("elllephantApiBaseUrl");

      return createClient({ baseUrl, tokenManager });
    },
    {
      name,
    },
  );
}

export const identityServiceClientFactory = createElllephantApiClientFactory(
  createIdentityServiceClient,
  {
    name: "identity-service-client",
  },
);

export const workspaceServiceClientFactory = createElllephantApiClientFactory(
  createWorkspaceServiceClient,
  {
    name: "workspace-service-client",
  },
);

export const driveServiceClientFactory = createElllephantApiClientFactory(
  createDriveServiceClient,
  {
    name: "drive-service-client",
  },
);

export const repositoryServiceClientFactory = createElllephantApiClientFactory(
  createRepositoryServiceClient,
  {
    name: "repository-service-client",
  },
);

export const intelligenceServiceClientFactory =
  createElllephantApiClientFactory(createIntelligenceServiceClient, {
    name: "intelligence-service-client",
  });

export const configurationServiceClientFactory =
  createElllephantApiClientFactory(createConfigurationServiceClient, {
    name: "configuration-service-client",
  });
