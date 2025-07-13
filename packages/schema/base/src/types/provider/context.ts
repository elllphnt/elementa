import { z } from "zod";
import type { Evaluable, ImportedValue, Resolvable } from "../_primitives/_.js";
import {
  evaluableSchema,
  importedValueSchema,
  resolvableSchema,
} from "../_primitives/_.js";
import type { BaseProviderData } from "./_base.js";
import { baseProviderDataSchema } from "./_base.js";

export type ContextProviderData = BaseProviderData<"context"> & {
  context?: ImportedValue;
  value?: Evaluable<any> | Resolvable<any>;
};

// Schemas

export const contextProviderDataSchema = baseProviderDataSchema.extend({
  context: importedValueSchema.optional(),
  value: z
    .union([evaluableSchema(z.any()), resolvableSchema(z.any())])
    .optional(),
});
