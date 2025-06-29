export interface ModuleHost {
  loadScript(url: string, code: string): Promise<void>;
  resolveImportUrl(url: string): string;
}
