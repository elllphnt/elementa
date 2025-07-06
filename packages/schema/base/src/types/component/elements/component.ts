import { z } from "zod";
import { type ResolvableOrEvaluable } from "../../_primitives/_.js";
import type { BaseElementData} from "./_base.js";
import { baseElementDataSchema } from "./_base.js";
import type {
  ElementContainerData} from "./_common/container.js";
import {
  elementContainerDataSchema,
} from "./_common/container.js";
import type {
  InteractiveData} from "./_common/interactive.js";
import {
  interactiveDataSchema,
} from "./_common/interactive.js";
import type { StylableData} from "./_common/stylable.js";
import { stylableDataSchema } from "./_common/stylable.js";

// Types

export type SlotFillData = StylableData &
  InteractiveData &
  ElementContainerData & {};

export type ComponentElementData = BaseElementData<"component"> &
  ElementContainerData & {
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
  props: z.record(z.any()).optional(),
  fills: z.record(slotFillDataSchema).optional(),
});
