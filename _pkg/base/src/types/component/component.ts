import { z } from "zod";
import {
  FragmentData,
  fragmentDataSchema,
  StateData,
  stateDataSchema,
} from "../_.js";
import { DataInputData, dataInputDataSchema } from "../_shared/data_input.js";

export type ComponentData = {
  name?: string;
  props?: DataInputData[];
  template?: FragmentData;
  fragments?: FragmentData[];
  states?: StateData[];
  editors?: Record<string, Record<string, unknown>>;
};

// Schemas

export const componentSchema = z.object({
  name: z.string().optional(),
  props: z.array(dataInputDataSchema).optional(),
  template: fragmentDataSchema.optional(),
  fragments: z.array(fragmentDataSchema).optional(),
  states: z.array(stateDataSchema).optional(),
  editors: z.record(z.record(z.unknown())).optional(),
});
