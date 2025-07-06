import { z } from "zod";
import type {
  StyleFragmentData} from "./fragments/fragment.js";
import {
  styleFragmentDataSchema,
} from "./fragments/fragment.js";
import type { StyleData } from "./style/_.js";

// Types

export type StyleSheetData = {
  styles?: Record<string, StyleData>;
  fragments?: StyleFragmentData[];
  conditions?: Record<string, string>;
};

// Schemas

export const styleSheetDataSchema = z.object({
  styles: z.record(z.record(z.any())).optional(),
  fragments: z.array(styleFragmentDataSchema).optional(),
  conditions: z.record(z.string()).optional(),
});
