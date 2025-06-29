import { z } from "zod";
import { StyleSheetData, styleSheetDataSchema } from "../../../style/_.js";

// Types

export type StylableData = {
  stylesheet?: StyleSheetData;
};

// Schemas

export const stylableDataSchema = z.object({
  stylesheet: styleSheetDataSchema.optional(),
});
