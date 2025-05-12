import { z } from "zod";
import { BaseElementData, baseElementDataSchema } from "./_base.js";
import {
  ElementContainerData,
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
