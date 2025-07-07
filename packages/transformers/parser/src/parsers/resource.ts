import type { FileContentTypeMap, FileType } from "@elllphnt/elementa-base";
import { parseComponent } from "./component/parser.js";

export function parseResource<T extends FileType>(
  type: T,
  content: string
): FileContentTypeMap[T] {
  switch (type) {
    case "component":
      return parseComponent(content) as FileContentTypeMap[T];
    default:
      throw new Error(`Unsupported resource type: ${type}`);
  }
}
