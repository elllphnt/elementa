import type { ImportData, StyleClassData } from "@elllphnt/elementa-base";
import type { ElementMetadata } from "~/libs/component/metadata.js";

export type UseImport = (options: ImportData) => string;
export type UseStyleClass = (
  id: string,
  styleClass: StyleClassData,
) => string | undefined;
export type UseElementMetadata = (
  metadata: ElementMetadata & {
    tag?: string;
  },
) => [idExpression: string, cssId: string];

export type GeneratorContext = {
  useImport: UseImport;
  useStyleClass: UseStyleClass;
  useElementMetadata: UseElementMetadata;
  getSystemModule: (name: string) => string;
};
