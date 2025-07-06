import { z } from "zod";
import type { BaseElementData} from "./_base.js";
import { baseElementDataSchema } from "./_base.js";
import type {
  ElementContainerData} from "./_common/container.js";
import {
  elementContainerDataSchema,
} from "./_common/container.js";

// Types

export type ContainerElementData = BaseElementData<"container"> &
  ElementContainerData & {};

// Schemas

export const containerElementDataSchema = baseElementDataSchema
  .merge(elementContainerDataSchema)
  .extend({
    type: z.literal("container"),
  });
