import { z } from "zod";
import { BaseElementData, baseElementDataSchema } from "./_base.js";

// Types

export type FragmentElementData = BaseElementData<"fragment"> & {
  fragmentId?: string;
};

// Schemas

export const fragmentElementDataSchema = baseElementDataSchema.extend({
  type: z.literal("fragment"),
  fragmentId: z.string().optional(),
});
