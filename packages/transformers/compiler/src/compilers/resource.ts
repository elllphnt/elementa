import type { FileContentTypeMap, FileType } from "@elllphnt/elementa-base";
import { compileComponent } from "./component/libs/component.js";

export function compileResource<T extends FileType>(
  type: T,
  content: FileContentTypeMap[T]
): string {
  switch (type) {
    case "component":
      return compileComponent(content as FileContentTypeMap[T]);
    default:
      throw new Error(`Unsupported resource type: ${type}`);
  }
}
