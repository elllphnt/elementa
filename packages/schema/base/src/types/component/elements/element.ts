import { z } from "zod";
import type {
  ComponentElementData} from "./component.js";
import {
  componentElementDataSchema,
} from "./component.js";
import type {
  ContainerElementData} from "./container.js";
import {
  containerElementDataSchema,
} from "./container.js";
import type {
  ExpressionElementData} from "./expression.js";
import {
  expressionElementDataSchema,
} from "./expression.js";
import type { FragmentElementData} from "./fragment.js";
import { fragmentElementDataSchema } from "./fragment.js";
import type { MediaElementData} from "./media.js";
import { mediaElementDataSchema } from "./media.js";
import type {
  PrimitiveElementData} from "./primitive.js";
import {
  primitiveElementDataSchema,
} from "./primitive.js";
import type { SlotElementData} from "./slot.js";
import { slotElementDataSchema } from "./slot.js";
import type { TextElementData} from "./text.js";
import { textElementDataSchema } from "./text.js";
import type { VectorElementData} from "./vector.js";
import { vectorElementDataSchema } from "./vector.js";

// Types

export type ElementData =
  | ContainerElementData
  | TextElementData
  | VectorElementData
  | SlotElementData
  | MediaElementData
  | ComponentElementData
  | PrimitiveElementData
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
