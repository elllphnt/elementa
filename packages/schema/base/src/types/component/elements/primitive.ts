import { z } from "zod";
import {
  importReferenceSchema,
  type ImportReference,
  type ResolvableOrEvaluable,
} from "../../_primitives/_.js";
import type { BaseElementData } from "./_base.js";
import { baseElementDataSchema } from "./_base.js";
import type { InteractiveData, StylableData } from "./_common/_.js";
import { interactiveDataSchema, stylableDataSchema } from "./_common/_.js";
import type { ElementContainerData } from "./_common/container.js";
import { elementContainerDataSchema } from "./_common/container.js";

export type PrimitiveSubElementData = StylableData & InteractiveData & {};

export type PrimitiveElementData = BaseElementData<"primitive"> &
  ElementContainerData & {
    primitiveRef?: ImportReference;
    elements?: Record<string, PrimitiveSubElementData>;
    props?: ResolvableOrEvaluable;
  };

// Schemas

export const primitiveSubElementDataSchema = stylableDataSchema.merge(
  interactiveDataSchema
);

export const primitiveElementDataSchema = baseElementDataSchema
  .merge(elementContainerDataSchema)
  .extend({
    type: z.literal("primitive"),
    primitive: importReferenceSchema.optional(),
    props: z.record(z.any()).optional(),
    elements: z.record(primitiveSubElementDataSchema).optional(),
  });
