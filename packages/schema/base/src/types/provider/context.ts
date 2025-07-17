import { z } from "zod";
import type {
  Evaluable,
  ImportReference,
  Resolvable,
} from "../_primitives/_.js";
import {
  evaluableSchema,
  importReferenceSchema,
  resolvableSchema,
} from "../_primitives/_.js";
import type { BaseProviderData } from "./_base.js";
import { baseProviderDataSchema } from "./_base.js";

export type ContextProviderData = BaseProviderData<"context"> & {
  contextRef?: ImportReference;
  value?: Evaluable<any> | Resolvable<any>;
};

// Schemas

export const contextProviderDataSchema = baseProviderDataSchema.extend({
  context: importReferenceSchema.optional(),
  value: z
    .union([evaluableSchema(z.any()), resolvableSchema(z.any())])
    .optional(),
});
