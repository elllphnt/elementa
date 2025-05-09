import { z } from "zod";

import {
  ComponentElementData,
  ContainerElementData,
  MediaElementData,
  PrimitiveElementData,
  SlotElementData,
  TextElementData,
  VectorElementData,
  componentElementDataSchema,
  containerElementDataSchema,
  mediaElementDataSchema,
  primitiveElementDataSchema,
  slotElementDataSchema,
  textElementDataSchema,
  vectorElementDataSchema,
} from "./_.js";

// Types

export type ElementData =
  | ComponentElementData
  | ContainerElementData
  | MediaElementData
  | PrimitiveElementData
  | SlotElementData
  | TextElementData
  | VectorElementData;

// Schemas

export const elementDataSchema: z.ZodType<ElementData> = z.lazy(() =>
  z.discriminatedUnion("type", [
    componentElementDataSchema,
    containerElementDataSchema,
    mediaElementDataSchema,
    primitiveElementDataSchema,
    slotElementDataSchema,
    textElementDataSchema,
    vectorElementDataSchema,
  ])
) as unknown as z.ZodType<ElementData>;
