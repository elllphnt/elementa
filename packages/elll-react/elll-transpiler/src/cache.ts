import { File } from "./file.js";

export type CachedResource = File & {
  files?: string[];
};

export abstract class Cache {
  abstract saveResource(data: CachedResource): Promise<void>;
  abstract getResource(id: string): Promise<CachedResource | undefined>;
  abstract removeResource(id: string): Promise<void>;
}
