import { z } from "zod";
import type {
  Evaluable,
  Resolvable} from "../_primitives/_.js";
import {
  evaluableSchema,
  resolvableSchema,
} from "../_primitives/_.js";
import type { BaseProviderData} from "./_base.js";
import { baseProviderDataSchema } from "./_base.js";

export type ContextProviderData = BaseProviderData<"context"> & {
  contextUrl?: string;
  value?: Evaluable<any> | Resolvable<any>;
};

// Schemas

export const contextProviderDataSchema = baseProviderDataSchema.extend({
  contextUrl: z.string().optional(),
  value: z
    .union([evaluableSchema(z.any()), resolvableSchema(z.any())])
    .optional(),
});
