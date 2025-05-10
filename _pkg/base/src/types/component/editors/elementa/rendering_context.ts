import { z } from "zod";
import { ColorData } from "../../../_primitives/_.js";
import {
  OverflowValue,
  StyleModifierData,
  styleModifierDataSchema,
} from "../../../style/_.js";

// Types

export type ColorThemeData = {
  scheme?: string;
  foreground?: ColorData;
  background?: ColorData;
};

export type ViewportData = {
  height?: number;
  width?: number;
  overflow?: OverflowValue;
};

export type RenderingContextData = {
  theme?: ColorThemeData;
  props?: Record<string, any>;
  viewport?: ViewportData;
  viewportEnabled?: boolean;
  styleModifierEnabled?: boolean;
  styleModifiers?: StyleModifierData[];
};

// Schemas

export const colorThemeDataSchema = z.object({
  scheme: z.string().optional(),
  foreground: z.any().optional(),
  background: z.any().optional(),
});

export const viewportDataSchema = z.object({
  height: z.number().optional(),
  width: z.number().optional(),
  overflow: z.string().optional(),
});

export const renderingContextDataSchema = z.object({
  theme: colorThemeDataSchema.optional(),
  props: z.record(z.any()).optional(),
  viewport: viewportDataSchema.optional(),
  viewportEnabled: z.boolean().optional(),
  styleModifierEnabled: z.boolean().optional(),
  styleModifiers: z.array(styleModifierDataSchema).optional(),
});
