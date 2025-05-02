import { ModuleHost } from "./module_host";

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
  }

  resolveImportUrl(url: string): string {
    const blobUrl = this.blobUrls.get(url);
    if (!blobUrl) {
      throw new Error(`No compiled module found for ${url}`);
    }
    return blobUrl;
  }
}
