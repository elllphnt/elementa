import { z } from "zod";

export type CssSelector = z.infer<typeof cssSelectorSchema>;

export const cssSelectorSchema = z.array(z.string());
