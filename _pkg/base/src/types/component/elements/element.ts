import { z } from "zod";
import {
  ComponentElementData,
  componentElementDataSchema,
} from "./component.js";
import {
  ContainerElementData,
  containerElementDataSchema,
} from "./container.js";
import { MediaElementData, mediaElementDataSchema } from "./media.js";
import {
  PrimitiveElementData,
  primitiveElementDataSchema,
} from "./primitive.js";
import { SlotElementData, slotElementDataSchema } from "./slot.js";
import { TextElementData, textElementDataSchema } from "./text.js";
import { VectorElementData, vectorElementDataSchema } from "./vector.js";

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
