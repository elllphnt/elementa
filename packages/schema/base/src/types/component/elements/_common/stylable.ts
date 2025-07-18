import { z } from "zod";
import type { StyleClassData } from "../../../style/_.js";
import { styleClassDataSchema } from "../../../style/_.js";

// Types

export type StylableData = {
  styleClass?: StyleClassData;
};

// Schemas

export const stylableDataSchema = z.object({
  stylesheet: styleClassDataSchema.optional(),
});
