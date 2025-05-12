import { ProviderData } from "../provider/_.js";
import { BaseElementData } from "./_base.js";
import { ElementData, elementDataSchema } from "./element.js";

import { z } from "zod";
import { providerDataSchema } from "../provider/provider.js";
import { baseElementDataSchema } from "./_base.js";

export type SlotElementData = BaseElementData<"slot"> & {
  placeholder?: ElementData[];
  providers?: ProviderData[];
};

// Schemas

export const slotElementDataSchema = baseElementDataSchema.extend({
  type: z.literal("slot"),
  placeholder: z.array(z.lazy(() => elementDataSchema)).optional(),
  providers: z.array(providerDataSchema).optional(),
});
