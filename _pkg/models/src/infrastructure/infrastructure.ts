import { FileSystem } from "./file_system/file_system";
import { ReferenceResolver } from "./reference_resolver";

export interface Infrastructure {
  fileSystem: FileSystem;
  referenceResolver: ReferenceResolver;
}
