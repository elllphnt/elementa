import { z } from "zod";
import type { Resolvable} from "../../_primitives/_.js";
import { resolvableSchema } from "../../_primitives/_.js";
import type {
  Evaluable} from "../../_primitives/dynamic/evaluable.js";
import {
  evaluableSchema,
} from "../../_primitives/dynamic/evaluable.js";
import type { BaseStateData} from "./_base.js";
import { baseStateDataSchema } from "./_base.js";

export type ValueStateData = BaseStateData<"value"> & {
  init?: Evaluable<any> | Resolvable<any>;
  tsType?: string;
};

// Schemas

export const valueStateDataSchema = baseStateDataSchema("value").extend({
  init: z
    .union([evaluableSchema(z.any()), resolvableSchema(z.any())])
    .optional(),
  tsType: z.string().optional(),
});
