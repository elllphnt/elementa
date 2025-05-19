import { z } from "zod";

export type BaseProviderData<T extends string> = {
  type: T;
  name?: string;
};

// Schemas

export const baseProviderDataSchema = z.object({
  type: z.string(),
  name: z.string().optional(),
});
