import { z } from "zod";
import { styleSheetDataSchema } from "../../../style/_.js";

// Types

export type StylableData = {
  classNames?: (string | [string, string])[];
};

// Schemas

export const stylableDataSchema = z.object({
  stylesheet: styleSheetDataSchema.optional(),
});
