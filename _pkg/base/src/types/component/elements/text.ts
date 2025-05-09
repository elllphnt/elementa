import { z } from "zod";
import {
  InteractiveData,
  interactiveDataSchema,
  LinkableData,
  linkableDataSchema,
  ResolvableOrEvaluable,
  resolvableOrEvaluableSchema,
  StylableData,
  stylableDataSchema,
} from "../../_.js";
import { BaseElementData, baseElementDataSchema } from "./_base.js";

export type TextMarkData = StylableData &
  LinkableData &
  InteractiveData & {
    tag?: string;
  };

export type TextElementData = BaseElementData & {
  type: "text";
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
