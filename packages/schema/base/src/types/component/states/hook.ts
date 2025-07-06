import { z } from "zod";
import type {
  ResolvableOrEvaluable} from "../../_primitives/_.js";
import {
  resolvableSchema,
} from "../../_primitives/_.js";
import { evaluableSchema } from "../../_primitives/dynamic/evaluable.js";
import type { BaseStateData} from "./_base.js";
import { baseStateDataSchema } from "./_base.js";

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
