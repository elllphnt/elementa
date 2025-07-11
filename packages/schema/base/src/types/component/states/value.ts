import { z } from "zod";
import type { ResolvableOrEvaluable, Type } from "../../_primitives/_.js";
import { resolvableSchema } from "../../_primitives/_.js";
import { evaluableSchema } from "../../_primitives/dynamic/evaluable.js";
import type { BaseStateData } from "./_base.js";
import { baseStateDataSchema } from "./_base.js";

export type ValueStateData = BaseStateData<"value"> & {
  init?: ResolvableOrEvaluable;
  tsType?: Type;
};

// Schemas

export const valueStateDataSchema = baseStateDataSchema("value").extend({
  init: z
    .union([evaluableSchema(z.any()), resolvableSchema(z.any())])
    .optional(),
  tsType: z.string().optional(),
});
