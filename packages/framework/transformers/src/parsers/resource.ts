import type { FileContentTypeMap, FileType } from "@elllphnt/elementa-base";
import { parseComponentModule } from "./component/module.js";
import { transformRouter } from "./router/router.js";

export function parseResource<T extends FileType>(
  type: T,
  content: string,
): FileContentTypeMap[T] {
  switch (type) {
    case "component":
      return parseComponentModule(content) as FileContentTypeMap[T];
    case "router":
      return transformRouter(JSON.parse(content)) as FileContentTypeMap[T];
    default:
      throw new Error(`Unsupported resource type: ${type}`);
  }
}
