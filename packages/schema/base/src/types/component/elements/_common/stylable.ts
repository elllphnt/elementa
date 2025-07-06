import { z } from "zod";
import type { StyleSheetData} from "../../../style/_.js";
import { styleSheetDataSchema } from "../../../style/_.js";

// Types

export type StylableData = {
  stylesheet?: StyleSheetData;
};

// Schemas

export const stylableDataSchema = z.object({
  stylesheet: styleSheetDataSchema.optional(),
});
