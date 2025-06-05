import { z } from "zod";
import { BaseElementData, baseElementDataSchema } from "./_base.js";

// Types

export type ExpressionElementData = BaseElementData<"expression"> & {
  expression?: string;
};

// Schemas

export const expressionElementDataSchema = baseElementDataSchema.extend({
  type: z.literal("expression"),
  expression: z.string().optional(),
});
