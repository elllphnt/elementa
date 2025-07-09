import type { FileType } from "@elllphnt/elementa-base";
import { fileTypes } from "@elllphnt/elementa-base";

export const fileExtensionList: (
  | [FileType, string[]]
  | [FileType, string[], string[]]
)[] = [
  [fileTypes.router, [".router.json", ".rt.json"]],
  [fileTypes.component, [".component.tsx"], [".component.json"]],
  [fileTypes.context, [".context.ts"]],
  [fileTypes.hook, [".hook.ts"]],
  [fileTypes.primitive, [".primitive.ts"]],
  [fileTypes.handler, [".handler.ts"]],
  [fileTypes.loader, [".loader.ts"]],
  [fileTypes.script, [".ts", ".script.ts"]],
  [fileTypes.json, [".json"]],
  [fileTypes.markdown, [".md"]],
  [fileTypes.text, [".txt"]],
];

export const fileExtensionMap: Record<
  FileType,
  [string[], string[]] | [string[]]
> = Object.fromEntries(
  fileExtensionList.map(([type, extensions, parsedExtensions]) => [
    type,
    parsedExtensions ? [extensions, parsedExtensions] : [extensions],
  ])
) as Record<FileType, [string[], string[]] | [string[]]>;

export function getFileExtensions(type: FileType): string[] {
  return fileExtensionMap[type][0];
}
export function getParsedFileExtensions(type: FileType): string[] {
  const entry = fileExtensionMap[type];
  return entry.length > 1 ? entry[1]! : entry[0];
}
