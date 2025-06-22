import { z } from "zod";
import {
  ResolvableOrEvaluable,
  resolvableOrEvaluableSchema,
} from "../../_primitives/_.js";
import { BaseElementData, baseElementDataSchema } from "./_base.js";
import {
  InteractiveData,
  interactiveDataSchema,
  LinkableData,
  linkableDataSchema,
  StylableData,
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
