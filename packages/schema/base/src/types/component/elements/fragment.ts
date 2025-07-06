import { z } from "zod";
import type { BaseElementData} from "./_base.js";
import { baseElementDataSchema } from "./_base.js";

// Types

export type FragmentElementData = BaseElementData<"fragment"> & {
  fragmentId?: string;
  params?: Record<string, any>;
};

// Schemas

export const fragmentElementDataSchema = baseElementDataSchema.extend({
  type: z.literal("fragment"),
  fragmentId: z.string().optional(),
  params: z.record(z.any()).optional(),
});
