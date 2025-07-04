import { moduleLogger } from "../../../loggers.js";
import type { ModuleHost } from "./module_host.js";

export class InMemoryModuleHost implements ModuleHost {
  private modules = new Map<string, string>(); // Map of url → JavaScript code
  private blobUrls = new Map<string, string>(); // Map of url → blob import URL

  async loadScript(url: string, code: string): Promise<void> {
    this.modules.set(url, code);

    // Revoke old blob if any
    const oldBlobUrl = this.blobUrls.get(url);
    if (oldBlobUrl) URL.revokeObjectURL(oldBlobUrl);

    // Create a new blob
    const blob = new Blob([code], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);
    this.blobUrls.set(url, blobUrl);

    moduleLogger.debug(`loadScript ${url}`, {
      url,
      codeLength: code.length,
      blobUrl,
      hadOldBlob: !!oldBlobUrl,
      totalModules: this.modules.size,
    });
  }

  resolveImportUrl(url: string): string {
    const blobUrl = this.blobUrls.get(url);
    if (!blobUrl) {
      moduleLogger.error(`resolveImportUrl ${url} - not found`, {
        url,
        availableUrls: Array.from(this.blobUrls.keys()),
      });
      throw new Error(`No compiled module found for ${url}`);
    }
    moduleLogger.debug(`resolveImportUrl ${url}`, { url, blobUrl });
    return blobUrl;
  }
}
