import { z } from "zod";
import { baseElementDataSchema } from "../_base.js";
import type { ElementData } from "../element.js";

// Types

export type ElementContainerData = {
  content?: ElementData[];
};

// Schemas

export const elementContainerDataSchema = z.object({
  content: z.lazy(() => z.array(baseElementDataSchema)).optional(), // Using z.lazy() properly
});
