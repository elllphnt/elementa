import { z } from "zod";
import { DataInputConfig, dataInputConfigSchema } from "./_shared/data_input";

// Types

export type HookConfig = {
  parameters?: DataInputConfig[];
};

// Schemas

export const hookConfigSchema = z.object({
  parameters: z.array(dataInputConfigSchema).optional(),
});
