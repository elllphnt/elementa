import { z } from "zod";
import { Evaluable, expressionSchema } from "./evaluable.js";
import { Resolvable, staticReferenceSchema } from "./resolvable.js";

// Types

export type ResolvableOrEvaluable<T> = Resolvable<T> | Evaluable<T>;

// Schemas

export const resolvableOrEvaluableSchema = <T extends z.ZodTypeAny>(
  valueSchema: T
) =>
  z.union([
    valueSchema,
    staticReferenceSchema(valueSchema),
    expressionSchema(valueSchema),
  ]);
