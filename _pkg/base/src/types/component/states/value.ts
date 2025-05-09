import { Resolvable } from "../../_.js";
import { Evaluable } from "../../_primitives/dynamic/evaluable.js";
import { BaseStateData } from "./_base.js";
import { z } from "zod";
import { evaluableSchema } from "../../_primitives/dynamic/evaluable.js";
import { resolvableSchema } from "../../_.js";
import { baseStateDataSchema } from "./_base.js";

export type ValueStateData = BaseStateData & {
  type: "value";
  init?: Evaluable<any> | Resolvable<any>;
  tsType?: string;
};

// Schemas

export const valueStateDataSchema = baseStateDataSchema.extend({
  type: z.literal("value"),
  init: z
    .union([evaluableSchema(z.any()), resolvableSchema(z.any())])
    .optional(),
  tsType: z.string().optional(),
});
