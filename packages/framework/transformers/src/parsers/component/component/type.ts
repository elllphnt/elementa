import type { StyleClassData } from "@elllphnt/elementa-base";
import type { ElementMetadata } from "~/libs/component/metadata.js";

export type ParseComponentContext = {
  getStyleClass: ({
    id,
    classes,
  }: {
    id?: string;
    classes?: (string | [string, string])[];
  }) => StyleClassData;
  getElementMeta: (id?: string) => ElementMetadata;
  isSystemModule(module: string, canonicalName: string): boolean;
};
