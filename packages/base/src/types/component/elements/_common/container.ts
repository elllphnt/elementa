import { z } from "zod";
import { ProviderData, providerDataSchema } from "../../../provider/_.js";
import { baseElementDataSchema } from "../_base.js";
import { ElementData } from "../element.js";

// Types

export type ElementContainerData = {
  content?: ElementData[];
  providers?: ProviderData[];
};

// Schemas

export const elementContainerDataSchema = z.object({
  content: z.lazy(() => z.array(baseElementDataSchema)).optional(), // Using z.lazy() properly
  providers: z.array(providerDataSchema).optional(),
});
