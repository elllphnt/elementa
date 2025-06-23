import fs from "fs";
import path from "path";

interface BuildCache {
  files: Record<string, number>;
}

export class IncrementalCache {
  private cache: BuildCache;
  private cacheFilePath: string;

  constructor(private outDir: string) {
    this.cacheFilePath = path.join(outDir, ".build-cache.json");
    this.cache = this.loadCache();
  }

  private loadCache(): BuildCache {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const content = fs.readFileSync(this.cacheFilePath, "utf-8");
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn("Failed to load build cache, starting fresh:", error);
    }
    return { files: {} };
  }

  private saveCache(): void {
    try {
      const dir = path.dirname(this.cacheFilePath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.warn("Failed to save build cache:", error);
    }
  }

  /**
   * Check if a file needs to be rebuilt based on modification times
   */
  shouldRebuild(sourceFilePath: string): boolean {
    try {
      // Get source file stats
      const sourceStats = fs.statSync(sourceFilePath);
      const sourceModified = sourceStats.mtimeMs;

      // Get cached information
      const cached = this.cache.files[sourceFilePath];
      if (!cached) {
        return true;
      }

      // Check if source file was modified since last build
      if (sourceModified > cached) {
        return true;
      }

      return false;
    } catch {
      // If there's any error checking stats, rebuild to be safe
      return true;
    }
  }

  /**
   * Update the cache with current file modification times
   */
  updateCache(sourceFilePath: string): void {
    try {
      const sourceStats = fs.statSync(sourceFilePath);
      this.cache.files[sourceFilePath] = sourceStats.mtimeMs;

      this.saveCache();
    } catch (error) {
      console.warn(`Failed to update cache for ${sourceFilePath}:`, error);
    }
  }

  /**
   * Remove a file from the cache (when source file is deleted)
   */
  removeFromCache(sourceFilePath: string): void {
    delete this.cache.files[sourceFilePath];
    this.saveCache();
  }

  /**
   * Clear the entire cache
   */
  clearCache(): void {
    this.cache = { files: {} };
    this.saveCache();
  }

  /**
   * Get cache statistics
   */
  getStats(): { totalFiles: number; cacheSize: string } {
    const totalFiles = Object.keys(this.cache.files).length;
    const cacheSize = Buffer.byteLength(JSON.stringify(this.cache)).toString();
    return { totalFiles, cacheSize };
  }
}
