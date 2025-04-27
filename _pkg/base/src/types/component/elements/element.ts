import {
  ComponentElementData,
  ContainerElementData,
  MediaElementData,
  PrimitiveElementData,
  SlotElementData,
  TextElementData,
  VectorElementData,
} from "./_.js";

export type ElementData =
  | ComponentElementData
  | ContainerElementData
  | MediaElementData
  | PrimitiveElementData
  | SlotElementData
  | TextElementData
  | VectorElementData;
