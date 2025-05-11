import { z } from "zod";

// Types

export type VariableFontAxisData = {
  tag: string;
  start: number;
  end: number;
};

export type TypefaceDefinition = {
  family: string;
  srcset: {
    [variant: string]: string;
  };
  variants: string[];
  axes?: Array<VariableFontAxisData>;
  category?: string;
};

export type TypefaceData = {
  id: string;
  name: string;
  definition?: TypefaceDefinition;
  variants?: string[];
};

// Schemas

export const variableFontAxisDataSchema = z.object({
  tag: z.string(),
  start: z.number(),
  end: z.number(),
});

export const typefaceDefinitionSchema = z.object({
  family: z.string(),
  srcset: z.record(z.string()),
  variants: z.array(z.string()),
  axes: z.array(variableFontAxisDataSchema).optional(),
  category: z.string().optional(),
});

export const typefaceDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  definition: typefaceDefinitionSchema.optional(),
  variants: z.array(z.string()).optional(),
});
