import { createWorkspaceServiceClient } from "@elllphnt/workspace-service-client";
import { getToken } from "../../routines/auth/token.js";

export const baseUrl = "https://api.elllephant.com";
export const tokenManager = {
  getToken: () => getToken(true),
};

export const workspaceServiceClient = createWorkspaceServiceClient({
  baseUrl,
  tokenManager,
});
