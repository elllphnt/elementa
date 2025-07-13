import { z } from "zod";
import type {
  ImportedValue,
  ResolvableOrEvaluable,
} from "../../_primitives/_.js";
import { importedValueSchema, resolvableSchema } from "../../_primitives/_.js";
import { evaluableSchema } from "../../_primitives/dynamic/evaluable.js";
import type { BaseStateData } from "./_base.js";
import { baseStateDataSchema } from "./_base.js";

export type HookStateData = BaseStateData<"hook"> & {
  hook?: ImportedValue;
  args?: ResolvableOrEvaluable;
};

// Schemas

export const hookStateDataSchema = baseStateDataSchema("hook").extend({
  hook: importedValueSchema.optional(),
  argMode: z.enum(["positional", "named"]).default("named"),
  args: z
    .record(z.union([evaluableSchema(z.any()), resolvableSchema(z.any())]))
    .optional(),
});
