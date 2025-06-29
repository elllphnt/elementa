import { z } from "zod";
import {
  ResolvableOrEvaluable,
  resolvableSchema,
} from "../../_primitives/_.js";
import { evaluableSchema } from "../../_primitives/dynamic/evaluable.js";
import { BaseStateData, baseStateDataSchema } from "./_base.js";

export type HookStateData = BaseStateData<"hook"> & {
  hookUrl?: string;
  argMode?: "positional" | "named"; // default: "named"
  args?: Record<string, ResolvableOrEvaluable<any>>;
};

// Schemas

export const hookStateDataSchema = baseStateDataSchema("hook").extend({
  hookUrl: z.string().optional(),
  argMode: z.enum(["positional", "named"]).default("named"),
  args: z
    .record(z.union([evaluableSchema(z.any()), resolvableSchema(z.any())]))
    .optional(),
});
