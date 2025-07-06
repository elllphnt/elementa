import { z } from "zod";
import type { PrimitiveElementData } from "../component/_.js";
import type {
  DataInputConfig} from "./_shared/data_input.js";
import {
  dataInputConfigSchema,
} from "./_shared/data_input.js";

// Types

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

// Schemas

export const primitiveElementConfigSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export const primitiveConfigSchema = z.object({
  props: z.record(dataInputConfigSchema).optional(),
  isContainer: z.boolean().optional(),
  init: z.record(z.any()).optional(),
  elements: z.record(primitiveElementConfigSchema).optional(),
});
