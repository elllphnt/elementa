import { HookStateData } from "./hook.js";
import { ValueStateData } from "./value.js";
import { z } from "zod";
import { valueStateDataSchema } from "./value.js";
import { hookStateDataSchema } from "./hook.js";

export type StateData = ValueStateData | HookStateData;

// Schemas

export const stateDataSchema = z.union([
  valueStateDataSchema,
  hookStateDataSchema,
]);
