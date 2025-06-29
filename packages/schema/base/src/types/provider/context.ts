import { z } from "zod";
import {
  Evaluable,
  evaluableSchema,
  Resolvable,
  resolvableSchema,
} from "../_primitives/_.js";
import { BaseProviderData, baseProviderDataSchema } from "./_base.js";

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
