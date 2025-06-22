import { SSEClient } from "../lib/sse.js";
import { backend } from "./backend.js";
import type { FileData, ProjectData } from "./types.js";

export type BaseResourceUpdateEvent<R extends string, P> = {
  id: string;
  resource: R;
  data: P;
};
export type ResourceUpdateEvent =
  | BaseResourceUpdateEvent<"project", ProjectData>
  | BaseResourceUpdateEvent<"file", FileData>
  | BaseResourceUpdateEvent<"content", undefined>;

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export const sseClient = new SSEClient<ResourceUpdateEvent>(SERVER_URL);
sseClient.connect();

sseClient.event$.subscribe((event) => {
  switch (event.resource) {
    case "project": {
      backend.addProject(event.data);
      break;
    }
    case "file": {
      // Extract projectId from the event id (assuming format: projectId:fileId)
      const projectId = event.id.split(":")[0];
      backend.addFile(projectId, event.data);
      break;
    }
    case "content": {
      // For content updates, we need to refetch the content
      const [contentProjectId, fileId] = event.id.split(":");
      if (contentProjectId && fileId) {
        backend.fetchFileContent(contentProjectId, fileId);
      }
      break;
    }
  }
});
