import { z } from "zod";
import { Evaluable, evaluableSchema } from "../../../_primitives/_.js";

// Types

export type RepeatMode = "fixed" | "dynamic";

export type ElementRepeatData = {
  mode?: RepeatMode;
  count?: Evaluable<number>;
  dataset?: Evaluable<any[]>;
};

export type RepeatableData = {
  repeat?: ElementRepeatData;
};

// Schemas

export const elementRepeatDataSchema = z.object({
  mode: z.enum(["fixed", "dynamic"]).optional(),
  count: evaluableSchema(z.number()).optional(),
  dataset: evaluableSchema(z.array(z.any())).optional(),
});

export const repeatableDataSchema = z.object({
  repeat: elementRepeatDataSchema.optional(),
});
