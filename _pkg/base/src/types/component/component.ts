import { z } from "zod";
import { DataInputData, dataInputDataSchema } from "../_shared/data_input.js";
import { FragmentData, fragmentDataSchema } from "./fragment.js";
import { StateData, stateDataSchema } from "./states/_.js";

export type ComponentData = {
  name?: string;
  props?: DataInputData[];
  template?: FragmentData;
  fragments?: FragmentData[];
  states?: StateData[];
  editors?: Record<string, Record<string, any>>;
};

// Schemas

export const componentSchema = z.object({
  name: z.string().optional(),
  props: z.array(dataInputDataSchema).optional(),
  template: fragmentDataSchema.optional(),
  fragments: z.array(fragmentDataSchema).optional(),
  states: z.array(stateDataSchema).optional(),
  editors: z.record(z.record(z.any())).optional(),
});
