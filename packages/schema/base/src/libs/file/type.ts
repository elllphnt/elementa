import type { ComponentData, RouterData } from "../../types/_.js";

export const fileTypes = {
  router: "router",
  component: "component",
  context: "context",
  hook: "hook",
  primitive: "primitive",
  handler: "handler",
  loader: "loader",
  script: "script",
  json: "json",
  markdown: "markdown",
  text: "text",
} as const;
export const fileTypeSet = new Set(Object.values(fileTypes));

export type FileType = (typeof fileTypes)[keyof typeof fileTypes];

export type FileContentTypeMap = {
  [fileTypes.router]: RouterData;
  [fileTypes.component]: ComponentData;
  [fileTypes.context]: string;
  [fileTypes.hook]: string;
  [fileTypes.primitive]: string;
  [fileTypes.handler]: string;
  [fileTypes.loader]: string;
  [fileTypes.script]: string;
  [fileTypes.json]: Record<string, unknown>;
  [fileTypes.markdown]: string;
  [fileTypes.text]: string;
};

export function isValidFileType(type: string): type is FileType {
  return fileTypeSet.has(type as FileType);
}
