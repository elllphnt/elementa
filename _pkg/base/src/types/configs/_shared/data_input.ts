import { z } from "zod";

// Types

export type DataInputConfig = {
  name?: string;
  identifier?: string;
  tsType?: string;
  required?: boolean;
};

// Schemas

export const dataInputConfigSchema = z.object({
  name: z.string().optional(),
  identifier: z.string().optional(),
  tsType: z.string().optional(),
  required: z.boolean().optional(),
});
