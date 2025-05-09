import {
  InteractiveData,
  ResolvableOrEvaluable,
  StylableData,
} from "../../_.js";
import { BaseElementData } from "./_base.js";
import { ElementContainerData } from "./_common/container.js";

import { z } from "zod";
import { interactiveDataSchema, stylableDataSchema } from "../../_.js";
import { baseElementDataSchema } from "./_base.js";
import { elementContainerDataSchema } from "./_common/container.js";

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
