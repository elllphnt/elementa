import { PrimitiveElementData } from "../_.js";
import { DataInputConfig } from "./_shared/data_input.js";

export type PrimitiveElementConfig = {
  name?: string;
  description?: string;
};

export type PrimitiveConfig = {
  props?: Record<string, DataInputConfig>;
  isContainer?: boolean;
  init?: Partial<PrimitiveElementData>;
  elements?: Record<string, PrimitiveElementConfig>;
};
