import { z } from "zod";
import { Resolvable, resolvableSchema } from "../../_primitives/_.js";
import {
  Evaluable,
  evaluableSchema,
} from "../../_primitives/dynamic/evaluable.js";
import { BaseStateData, baseStateDataSchema } from "./_base.js";

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
