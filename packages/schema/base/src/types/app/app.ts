import { z } from "zod";
import { importedValueSchema, type ImportedValue } from "../_primitives/_.js";

export type AppData = {
  router?: ImportedValue;
};

export const appSchema = z.object({
  router: importedValueSchema.optional(),
});
