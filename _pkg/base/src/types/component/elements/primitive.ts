import { z } from "zod";
import { ResolvableOrEvaluable } from "../../_primitives/_.js";
import { BaseElementData, baseElementDataSchema } from "./_base.js";
import {
  InteractiveData,
  interactiveDataSchema,
  StylableData,
  stylableDataSchema,
} from "./_common/_.js";
import {
  ElementContainerData,
  elementContainerDataSchema,
} from "./_common/container.js";

export type PrimitiveSubElementData = StylableData & InteractiveData & {};

export type PrimitiveElementData = BaseElementData &
  ElementContainerData & {
    type: "primitive";
    primitiveUrl?: string;
    props?: Record<string, ResolvableOrEvaluable<unknown>>;
    elements?: Record<string, PrimitiveSubElementData>;
  };

// Schemas

export const primitiveSubElementDataSchema = stylableDataSchema.merge(
  interactiveDataSchema
);

export const primitiveElementDataSchema = baseElementDataSchema
  .merge(elementContainerDataSchema)
  .extend({
    type: z.literal("primitive"),
    primitiveUrl: z.string().optional(),
    props: z.record(z.unknown()).optional(),
    elements: z.record(primitiveSubElementDataSchema).optional(),
  });
