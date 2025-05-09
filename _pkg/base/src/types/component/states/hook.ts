import { Resolvable } from "../../_.js";
import { Evaluable } from "../../_primitives/dynamic/evaluable.js";
import { BaseStateData } from "./_base.js";
import { z } from "zod";
import { evaluableSchema } from "../../_primitives/dynamic/evaluable.js";
import { resolvableSchema } from "../../_.js";
import { baseStateDataSchema } from "./_base.js";

export type HookStateData = BaseStateData & {
  type: "hook";
  hookUrl?: string;
  args?: (Evaluable<any> | Resolvable<any>)[];
};

// Schemas

export const hookStateDataSchema = baseStateDataSchema.extend({
  type: z.literal("hook"),
  hookUrl: z.string().optional(),
  args: z
    .array(z.union([evaluableSchema(z.any()), resolvableSchema(z.any())]))
    .optional(),
});
