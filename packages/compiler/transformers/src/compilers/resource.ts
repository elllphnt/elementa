import type { FileContentTypeMap, FileType } from "@elllphnt/elementa-base";
import { compileComponent } from "./component/component/component.js";
import { compileRouter } from "./router/router.js";

export function compileResource<T extends FileType>(
  type: T,
  content: FileContentTypeMap[T],
): string {
  switch (type) {
    case "component":
      return compileComponent(content as FileContentTypeMap["component"]);
    case "router":
      return JSON.stringify(
        compileRouter(content as FileContentTypeMap["router"]),
        null,
        2,
      );
    default:
      throw new Error(`Unsupported resource type: ${type}`);
  }
}
