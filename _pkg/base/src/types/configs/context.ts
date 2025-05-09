import { z } from "zod";

// Types

export type ContextConfig = {
  tsType?: string;
};

// Schemas

export const contextConfigSchema = z.object({
  tsType: z.string().optional(),
});
