import type { FileContentTypeMap, FileType } from "@elllphnt/elementa-base";
import { parseComponentModule } from "./component/module.js";

export function parseResource<T extends FileType>(
  type: T,
  content: string
): FileContentTypeMap[T] {
  switch (type) {
    case "component":
      return parseComponentModule(content) as FileContentTypeMap[T];
    default:
      throw new Error(`Unsupported resource type: ${type}`);
  }
}
