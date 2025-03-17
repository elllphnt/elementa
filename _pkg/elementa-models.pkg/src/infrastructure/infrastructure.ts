import { Reference } from "@elllphnt/elll-element";
import { FileSystem } from "./file_system";

export abstract class Infrastructure {
  abstract get fileSystem(): FileSystem;
  abstract resolveReference(ref: Reference): Promise<any>;
}
