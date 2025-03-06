import { FileSystem } from "./file_system";

export abstract class Infrastructure {
  abstract get fileSystem(): FileSystem;
}
