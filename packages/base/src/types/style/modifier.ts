import { z } from "zod";
import { StyleDataType } from "../_primitives/_.js";

// Types

export enum StyleModifierType {
  Context = "context",
  Element = "element",
}

export type StyleModifierDefinitionData = {
  id: string;
  name: string;
  type: StyleModifierType;
  signature?: StyleDataType[];
  predecence?: number;
  selector?: string[];
};

export type StyleModifierData = {
  name: string;
  args?: any[];
};

export type ElllSelectorData = StyleModifierData[];

// Schemas

export const styleModifierDefinitionDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum([StyleModifierType.Context, StyleModifierType.Element]),
  signature: z.array(z.nativeEnum(StyleDataType)).optional(),
  predecence: z.number().optional(),
  selector: z.string().optional(), // loosely typed
});

export const styleModifierDataSchema = z.object({
  name: z.string(),
  args: z.array(z.any()).optional(),
});

export const elllSelectorDataSchema = z.array(styleModifierDataSchema);
