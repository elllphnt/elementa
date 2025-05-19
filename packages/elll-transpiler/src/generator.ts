import { Cache } from "./cache.js";
import { File } from "./file.js";
import { FileSystem } from "./fs.js";

export type GenerationResult = {
  files?: Array<{
    path: string;
    content: string;
  }>;
};

export type Generator = (
  file: File,
  context: GenerationContext,
) => Promise<GenerationResult>;

export type GenerationContext = {
  generators: Record<string, Generator>;
  cache: Cache;
  fs: FileSystem;
  paths: {
    outDir: string;
  };

  // file
  resolveFile: (url: string) => Promise<File | undefined>;
  readFileContent: (id: string) => Promise<string>;
};
