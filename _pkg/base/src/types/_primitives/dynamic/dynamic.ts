import { z } from "zod";
import { Evaluable } from "./evaluable.js";
import { expressionSchema } from "./expression.js";
import { staticReferenceSchema } from "./reference.js";
import { Resolvable } from "./resolvable.js";

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
