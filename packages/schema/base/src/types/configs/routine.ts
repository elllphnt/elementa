import { z } from "zod";
import { DataInputConfig, dataInputConfigSchema } from "./_shared/_.js";

// Types

export type RoutineConfig = {
  parameters?: DataInputConfig[];
};

// Schemas

export const routineConfigSchema = z.object({
  parameters: z.array(dataInputConfigSchema).optional(),
});
