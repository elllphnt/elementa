import { z } from "zod";
import {
  ComponentElementData,
  componentElementDataSchema,
} from "./component.js";
import {
  ContainerElementData,
  containerElementDataSchema,
} from "./container.js";
import {
  ExpressionElementData,
  expressionElementDataSchema,
} from "./expression.js";
import { FragmentElementData, fragmentElementDataSchema } from "./fragment.js";
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
  | VectorElementData
  | ExpressionElementData
  | FragmentElementData;

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
    expressionElementDataSchema,
    fragmentElementDataSchema,
  ])
) as any as z.ZodType<ElementData>;
