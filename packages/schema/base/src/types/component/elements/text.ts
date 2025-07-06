import { z } from "zod";
import type {
  ResolvableOrEvaluable} from "../../_primitives/_.js";
import {
  resolvableOrEvaluableSchema,
} from "../../_primitives/_.js";
import type { BaseElementData} from "./_base.js";
import { baseElementDataSchema } from "./_base.js";
import type {
  InteractiveData,
  LinkableData,
  StylableData} from "./_common/_.js";
import {
  interactiveDataSchema,
  linkableDataSchema,
  stylableDataSchema,
} from "./_common/_.js";

export type TextMarkData = StylableData &
  LinkableData &
  InteractiveData & {
    tag?: string;
  };

export type TextElementData = BaseElementData<"text"> & {
  text?: ResolvableOrEvaluable<string>;
  marks?: TextMarkData[];
};

// Schemas

export const textMarkDataSchema = stylableDataSchema
  .merge(linkableDataSchema)
  .merge(interactiveDataSchema)
  .extend({
    tag: z.string().optional(),
  });

export const textElementDataSchema = baseElementDataSchema.extend({
  type: z.literal("text"),
  text: resolvableOrEvaluableSchema(z.string()).optional(),
  marks: z.array(textMarkDataSchema).optional(),
});
