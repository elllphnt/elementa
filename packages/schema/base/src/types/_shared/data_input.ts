import { z } from "zod";
import type {
  Resolvable} from "../_primitives/dynamic/resolvable.js";
import {
  resolvableSchema,
} from "../_primitives/dynamic/resolvable.js";

// Types

export type DataInputData = {
  name: string;
  varName?: string;
  tsType?: string;
  required?: boolean;
  defaultValue?: Resolvable<any>;
};

// Schemas

export const dataInputDataSchema = z.object({
  name: z.string(),
  varName: z.string().optional(),
  tsType: z.string().optional(),
  required: z.boolean().optional(),
  default: resolvableSchema(z.any()).optional(),
});
