import { z } from "zod";
import {
  type ResolvableOrEvaluable,
  resolvableOrEvaluableSchema,
} from "../../_primitives/_.js";
import { BaseElementData, baseElementDataSchema } from "./_base.js";
import {
  ElementContainerData,
  elementContainerDataSchema,
} from "./_common/container.js";
import {
  InteractiveData,
  interactiveDataSchema,
} from "./_common/interactive.js";
import { StylableData, stylableDataSchema } from "./_common/stylable.js";

// Types

export type SlotFillData = StylableData &
  InteractiveData &
  ElementContainerData & {};

export type ComponentElementData = BaseElementData<"component"> & {
  componentUrl?: string;
  props?: Record<string, ResolvableOrEvaluable<any>>;
  fills?: Record<string, SlotFillData>;
};

// Schemas

export const slotFillDataSchema = stylableDataSchema
  .merge(interactiveDataSchema)
  .merge(elementContainerDataSchema);

export const componentElementDataSchema = baseElementDataSchema.extend({
  type: z.literal("component"),
  componentUrl: z.string().optional(),
  props: z.record(resolvableOrEvaluableSchema(z.any())).optional(),
  fills: z.record(slotFillDataSchema).optional(),
});
