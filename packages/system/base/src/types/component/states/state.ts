import { z } from "zod";
import { HookStateData, hookStateDataSchema } from "./hook.js";
import { InlineStateData, inlineStateDataSchema } from "./inline.js";
import { ValueStateData, valueStateDataSchema } from "./value.js";

export type StateData = ValueStateData | HookStateData | InlineStateData;

// Schemas

export const stateDataSchema = z.discriminatedUnion("type", [
  valueStateDataSchema,
  hookStateDataSchema,
  inlineStateDataSchema,
]);
