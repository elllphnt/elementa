import { TokenManager } from "@elllphnt/elll-client";
import { createIdentityServiceClient } from "@elllphnt/identity-service-client";
import { createWorkspaceServiceClient } from "@elllphnt/workspace-service-client";
import token from "../local/token.json";

const baseUrl = "https://api.elllephant.com";
export const tokenManager: TokenManager = {
  getToken: async () => {
    return token.access_token;
  },
};

function getTokenManager() {
  return tokenManager;
}

export function getRepositoryServiceCLient() {
  return createWorkspaceServiceClient({
    baseUrl,
    tokenManager: getTokenManager(),
  });
}

export function getIdentityServiceCLient() {
  return createIdentityServiceClient({
    baseUrl,
    tokenManager: getTokenManager(),
  });
}

export async function getUser(user_id: string) {
  const client = getIdentityServiceCLient();
  const result = await client.get("/users/{user_id}", {
    params: {
      path: {
        user_id,
      },
    },
  });

  if (!result.response.ok) {
    throw result.error;
  }

  return result.data!;
}
