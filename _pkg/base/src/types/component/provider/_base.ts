import { z } from "zod";

export type BaseProviderData = {
  type: string;
  name?: string;
};

// Schemas

export const baseProviderDataSchema = z.object({
  type: z.string(),
  name: z.string().optional(),
});
