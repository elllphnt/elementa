import { FileWatcherService } from "../services/file-watcher";
import { SSEService } from "../services/sse";
import { Infrastructure } from "../types";
import {
  getFileTypeFromPath,
  LocalStorageInfrastructure,
} from "./local-storage";

export function initializeLocalInfrastructure({
  url: infrastructureUrl,
  sseService,
}: {
  url: string;
  sseService?: SSEService;
}): Infrastructure {
  const url = new URL(infrastructureUrl);
  const path = url.pathname;
  const infrastructure = new LocalStorageInfrastructure(path);

  const rootPath = infrastructure.getRootPath();
  const fileWatcher = new FileWatcherService(rootPath);

  fileWatcher.on("file", (event) => {
    if (event.action === "change") {
      sseService?.broadcastEvent({
        id: `${event.projectId}:${event.id}`,
        resource: "content",
      });
    } else if (event.action === "add") {
      sseService?.broadcastEvent({
        id: `${event.projectId}:${event.id}`,
        resource: "file" as const,
        data: {
          id: event.id,
          path: decodeURIComponent(event.id),
          type: getFileTypeFromPath(decodeURIComponent(event.id)),
        },
      });
    } else {
      sseService?.broadcastEvent({
        id: `${event.projectId}:${event.id}`,
        resource: "file" as const,
      });
    }
  });
  fileWatcher.on("project", (event) => {
    const clientEvent = {
      id: event.id,
      resource: "project" as const,
      data: {
        id: event.id,
        name: decodeURIComponent(event.id),
      },
    };
    sseService?.broadcastEvent(clientEvent);
  });
  fileWatcher.on("directory", (event) => {
    // For directory changes, we might want to notify about content changes
    const clientEvent = {
      id: `${event.projectId}:${encodeURIComponent(event.path)}`,
      resource: "content" as const,
      data: undefined,
    };
    sseService?.broadcastEvent(clientEvent);
  });

  fileWatcher.watch();
  return infrastructure;
}

export function initializeInfrastructure({
  url: infrastructureUrl,
  sseService,
}: {
  url: string;
  sseService?: SSEService;
}): Infrastructure {
  const url = new URL(infrastructureUrl);

  switch (url.protocol) {
    case "local:": {
      return initializeLocalInfrastructure({
        url: infrastructureUrl,
        sseService,
      });
    }
    default:
      throw new Error(`Unsupported infrastructure type: ${url.protocol}`);
  }
}
