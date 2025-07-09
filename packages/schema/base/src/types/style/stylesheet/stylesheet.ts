import { z } from "zod";
import type { StyleFragmentData } from "./fragments/fragment.js";
import { styleFragmentDataSchema } from "./fragments/fragment.js";
import type { KeyframeSetData } from "./keyframes.js";
import type { StyleData } from "./style/_.js";

// Types

export type StyleClassData = {
  name?: string;
  styles?: Record<string, StyleData>;
  fragments?: StyleFragmentData[];
};

export type StyleSheetData = {
  classes?: StyleClassData[];
  keyframeSets?: KeyframeSetData[];
};

// Schemas

export const styleSheetDataSchema = z.object({
  styles: z.record(z.record(z.any())).optional(),
  fragments: z.array(styleFragmentDataSchema).optional(),
  conditions: z.record(z.string()).optional(),
});
