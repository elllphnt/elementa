import { createIdentityServiceClient } from "@elllphnt/identity-service-client";
import { baseUrl, tokenManager } from "./_common.js";

export const identityServiceClient = createIdentityServiceClient({
  baseUrl,
  tokenManager,
});

export async function getUser(user_id: string) {
  const result = await identityServiceClient.get("/users/{user_id}", {
    params: {
      path: {
        user_id,
      },
    },
  });

  if (result.response.status === 404) {
    return undefined;
  }
  if (!result.response.ok) {
    throw new Error(
      `Failed to get user ${user_id}: ${result.response.statusText}`,
    );
  }

  return result.data;
}
