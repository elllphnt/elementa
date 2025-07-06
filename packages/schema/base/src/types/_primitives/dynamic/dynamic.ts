import { z } from "zod";
import type { Evaluable} from "./evaluable.js";
import { expressionSchema } from "./evaluable.js";
import type { Resolvable} from "./resolvable.js";
import { staticReferenceSchema } from "./resolvable.js";

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
