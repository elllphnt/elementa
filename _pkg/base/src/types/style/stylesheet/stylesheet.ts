import { z } from "zod";
import { styleFragmentDataSchema } from "./fragments/fragment.js";

// Types

export type StyleData = Record<string, unknown>;

export type StyleSheetData = {
  styles?: Record<string, StyleData>;
  fragments?: StyleFragmentData[];
  conditions?: Record<string, string>;
};

// Schemas

export const styleSheetDataSchema = z.object({
  styles: z.record(z.record(z.unknown())).optional(),
  fragments: z.array(styleFragmentDataSchema).optional(),
  conditions: z.record(z.string()).optional(),
});
