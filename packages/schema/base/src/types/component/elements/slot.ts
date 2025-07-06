import type { BaseElementData } from "./_base.js";
import type { ElementData } from "./element.js";

import { z } from "zod";
import { baseElementDataSchema } from "./_base.js";

export type SlotElementData = BaseElementData<"slot"> & {
  mode?: "fill" | "outlet" | "children";
  placeholder?: ElementData[];
};

// Schemas

export const slotElementDataSchema = baseElementDataSchema.extend({
  type: z.literal("slot"),
  mode: z.enum(["fill", "outlet", "children"]).optional(),
  placeholder: z.lazy(() => z.array(baseElementDataSchema)).optional(), // Using z.lazy() properly
});
