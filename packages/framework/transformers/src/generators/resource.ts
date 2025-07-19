import type { FileContentTypeMap, FileType } from "@elllphnt/elementa-base";
import { compileRouter } from "./router/router.js";

export function compileResource<T extends FileType>(
  type: T,
  content: FileContentTypeMap[T]
): string {
  switch (type) {
    case "router":
      return JSON.stringify(
        compileRouter(content as FileContentTypeMap["router"]),
        null,
        2
      );
    default:
      throw new Error(`Unsupported resource type: ${type}`);
  }
}
