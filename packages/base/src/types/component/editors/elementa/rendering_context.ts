import { z } from "zod";
import { ColorData } from "../../../_primitives/_.js";
import { CrdtAtomic, crdtAtomicSchema } from "../../../_shared/_.js";
import {
  OverflowValue,
  StyleModifierData,
  styleModifierDataSchema,
} from "../../../style/_.js";

// Types

export type ColorThemeData = CrdtAtomic<["foreground", "background"]> & {
  scheme?: string;
  foreground?: ColorData;
  background?: ColorData;
};

export type ViewportData = {
  height?: number;
  width?: number;
  overflow?: OverflowValue;
};

export type RenderingContextData = CrdtAtomic<["styleModifiers[*]"]> & {
  theme?: ColorThemeData;
  viewport?: ViewportData;
  viewportEnabled?: boolean;
  styleModifierEnabled?: boolean;
  styleModifiers?: StyleModifierData[];
};

// Schemas

export const colorThemeDataSchema = crdtAtomicSchema([
  "foreground",
  "background",
]).extend({
  scheme: z.string().optional(),
  foreground: z.any().optional(),
  background: z.any().optional(),
});

export const viewportDataSchema = z.object({
  height: z.number().optional(),
  width: z.number().optional(),
  overflow: z.string().optional(),
});

export const renderingContextDataSchema = crdtAtomicSchema([
  "styleModifiers[*]",
]).extend({
  theme: colorThemeDataSchema.optional(),
  viewport: viewportDataSchema.optional(),
  viewportEnabled: z.boolean().optional(),
  styleModifierEnabled: z.boolean().optional(),
  styleModifiers: z.array(styleModifierDataSchema).optional(),
});
