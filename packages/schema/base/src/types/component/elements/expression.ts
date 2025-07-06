import { z } from "zod";
import type { BaseElementData} from "./_base.js";
import { baseElementDataSchema } from "./_base.js";

// Types

export type ExpressionElementData = BaseElementData<"expression"> & {
  expression?: string;
};

// Schemas

export const expressionElementDataSchema = baseElementDataSchema.extend({
  type: z.literal("expression"),
  expression: z.string().optional(),
});
