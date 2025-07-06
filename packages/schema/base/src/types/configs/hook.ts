import { z } from "zod";
import type {
  DataInputConfig} from "./_shared/data_input.js";
import {
  dataInputConfigSchema,
} from "./_shared/data_input.js";

// Types

export type HookConfig = {
  parameters?: DataInputConfig[];
};

// Schemas

export const hookConfigSchema = z.object({
  parameters: z.array(dataInputConfigSchema).optional(),
});
