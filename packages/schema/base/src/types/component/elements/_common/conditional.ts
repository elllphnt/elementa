import { z } from "zod";
import { Evaluable, evaluableSchema } from "../../../_primitives/_.js";

// Types

export type ConditionalData = {
  condition?: Evaluable<boolean>;
};

// Schemas

export const conditionalDataSchema = z.object({
  condition: evaluableSchema(z.boolean()).optional(),
});
