import { z } from "zod";

export type ImportData = {
  module: string;
  name?: string;
  alias?: string;
};
export type ImportedValue = {
  __import: ImportData;
};

export const importedValueSchema = z.object({
  __import: z.object({
    module: z.string(),
    name: z.string().optional(),
    alias: z.string().optional(),
  }),
});
