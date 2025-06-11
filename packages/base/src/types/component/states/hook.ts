import { z } from "zod";
import {
  ResolvableOrEvaluable,
  resolvableSchema,
} from "../../_primitives/_.js";
import { evaluableSchema } from "../../_primitives/dynamic/evaluable.js";
import { BaseStateData, baseStateDataSchema } from "./_base.js";

export type HookStateData = BaseStateData<"hook"> & {
  hookUrl?: string;
  args?: ResolvableOrEvaluable<any>[];
};

// Schemas

export const hookStateDataSchema = baseStateDataSchema.extend({
  type: z.literal("hook"),
  hookUrl: z.string().optional(),
  args: z
    .array(z.union([evaluableSchema(z.any()), resolvableSchema(z.any())]))
    .optional(),
});
