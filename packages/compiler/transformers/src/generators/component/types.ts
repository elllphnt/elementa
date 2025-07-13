import type { ImportData } from "@elllphnt/elementa-base";

export type UseImport = (options: ImportData) => string;
export type GeneratorContext = {
  useImport: UseImport;
};
