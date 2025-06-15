import { Infrastructure } from "../types";
import { LocalStorageInfrastructure } from "./local-storage";

export function createInfrastructure(
  infrastructureUrl: string
): Infrastructure {
  const url = new URL(infrastructureUrl);

  switch (url.protocol) {
    case "local:": {
      const path = url.pathname;
      return new LocalStorageInfrastructure(path);
    }
    default:
      throw new Error(`Unsupported infrastructure type: ${url.protocol}`);
  }
}
