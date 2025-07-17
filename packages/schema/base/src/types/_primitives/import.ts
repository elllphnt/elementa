import { z } from "zod";

export type ImportData = {
  module: string;
  name?: string;
  alias?: string;
};
export type ImportReference = {
  __import: ImportData;
};

export const importReferenceSchema = z.object({
  __import: z.object({
    module: z.string(),
    name: z.string().optional(),
    alias: z.string().optional(),
  }),
});
