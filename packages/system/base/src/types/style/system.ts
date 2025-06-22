import { z } from "zod";
import { CrdtAtomic, crdtAtomicSchema } from "../_shared/_.js";
import { StyleModifierData, styleModifierDataSchema } from "./modifier.js";

export type ColorSchemeDefinitionData = CrdtAtomic<["modifiers[*]"]> & {
  name?: string;
  modifiers?: StyleModifierData[];
};

export type ColorSchemeSourceType = "system" | "definitions";
export type ColorSchemeSetData = CrdtAtomic<["definitions[*]"]> & {
  source: ColorSchemeSourceType;
  definitions?: ColorSchemeDefinitionData[];
};

export type ViewportDefinitionData = CrdtAtomic<
  ["width", "height", "ratio", "modifiers[*]"]
> & {
  name?: string;
  width?: [number | null, number | null];
  height?: [number | null, number | null];
  ratio?: [number | null, number | null];
  modifiers?: StyleModifierData[];
};

export type ViewportSourceType = "breakpoints" | "definitions";
export type ViewportSetData = CrdtAtomic<["definitions[*]"]> & {
  source: ViewportSourceType;
  breakpoints?: Record<string, number>;
  definitions?: ViewportDefinitionData[];
};

export type StyleSystemData = {
  colorSchemes?: ColorSchemeSetData;
  viewports?: ViewportSetData;
  stylesheetUrls?: string[];
};

// Schema

export const colorSchemeDefinitionDataSchema = crdtAtomicSchema([
  "modifiers[*]",
]).extend({
  name: z.string().optional(),
  modifiers: z.array(styleModifierDataSchema).optional(),
});

export const colorSchemeSetDataSchema = crdtAtomicSchema([
  "definitions[*]",
]).extend({
  source: z.enum(["system", "definitions"]),
  definitions: z.array(colorSchemeDefinitionDataSchema).optional(),
});

export const viewportDefinitionDataSchema = crdtAtomicSchema([
  "width",
  "height",
  "ratio",
  "modifiers[*]",
]).extend({
  name: z.string().optional(),
  width: z.tuple([z.number().nullable(), z.number().nullable()]).optional(),
  height: z.tuple([z.number().nullable(), z.number().nullable()]).optional(),
  ratio: z.tuple([z.number().nullable(), z.number().nullable()]).optional(),
  modifiers: z.array(styleModifierDataSchema).optional(),
});

export const viewportSetDataSchema = crdtAtomicSchema([
  "definitions[*]",
]).extend({
  source: z.enum(["breakpoints", "definitions"]),
  breakpoints: z.record(z.number()).optional(),
  definitions: z.array(viewportDefinitionDataSchema).optional(),
});

export const StyleSystemSchema = z.object({
  colorSchemes: colorSchemeSetDataSchema.optional(),
  viewports: viewportSetDataSchema.optional(),
  stylesheets: z.array(z.string()).optional(),
});
