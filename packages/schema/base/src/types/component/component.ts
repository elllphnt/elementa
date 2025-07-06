import { z } from "zod";
import type { DataInputData } from "../_shared/data_input.js";
import { dataInputDataSchema } from "../_shared/data_input.js";
import type { ElementContainerData } from "./elements/_.js";
import { elementContainerDataSchema } from "./elements/_.js";
import type { FragmentData } from "./fragment.js";
import { fragmentDataSchema } from "./fragment.js";
import type { StateData } from "./states/_.js";
import { stateDataSchema } from "./states/_.js";

export type ComponentData = ElementContainerData & {
  name?: string;
  props?: DataInputData[];
  fragments?: FragmentData[];
  states?: StateData[];
  editors?: Record<string, Record<string, any>>;
};

// Schemas

export const componentSchema = elementContainerDataSchema.extend({
  name: z.string().optional(),
  props: z.array(dataInputDataSchema).optional(),
  fragments: z.array(fragmentDataSchema).optional(),
  states: z.array(stateDataSchema).optional(),
  editors: z.record(z.record(z.any())).optional(),
});
