import { z } from "zod";
import type { HookStateData} from "./hook.js";
import { hookStateDataSchema } from "./hook.js";
import type { InlineStateData} from "./inline.js";
import { inlineStateDataSchema } from "./inline.js";
import type { ValueStateData} from "./value.js";
import { valueStateDataSchema } from "./value.js";

export type StateData = ValueStateData | HookStateData | InlineStateData;

// Schemas

export const stateDataSchema = z.discriminatedUnion("type", [
  valueStateDataSchema,
  hookStateDataSchema,
  inlineStateDataSchema,
]);
