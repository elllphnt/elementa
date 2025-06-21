import { FileWatcherService } from "../services/file-watcher";
import { SSEService } from "../services/sse";
import { Infrastructure } from "../types";
import { LocalStorageInfrastructure } from "./local-storage";

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
    sseService?.broadcastEvent("file", event);
  });
  fileWatcher.on("project", (event) => {
    sseService?.broadcastEvent("project", event);
  });
  fileWatcher.on("directory", (event) => {
    sseService?.broadcastEvent("directory", event);
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
