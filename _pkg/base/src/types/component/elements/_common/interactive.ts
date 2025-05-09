import { z } from "zod";
import { Expression, expressionSchema } from "../../../_primitives/_";

// Types

export type InteractiveData = {
  interactions?: Record<string, Expression>;
};

// Schemas

export const interactiveDataSchema = z.object({
  interactions: z.record(expressionSchema(z.unknown())).optional(),
});
