import { z } from "zod";
import { DataInputData, dataInputDataSchema } from "../_shared/data_input.js";
import {
  ElementData,
  expressionElementDataSchema,
  fragmentElementDataSchema,
} from "./elements/_.js";
import { FragmentData, fragmentDataSchema } from "./fragment.js";
import { StateData, stateDataSchema } from "./states/_.js";

export type ComponentData = {
  name?: string;
  props?: DataInputData[];
  fragments?: FragmentData[];
  states?: StateData[];
  template?: ElementData;
  editors?: Record<string, Record<string, any>>;
};

// Schemas

export const componentSchema = z.object({
  name: z.string().optional(),
  props: z.array(dataInputDataSchema).optional(),
  fragments: z.array(fragmentDataSchema).optional(),
  states: z.array(stateDataSchema).optional(),
  template: z
    .discriminatedUnion("type", [
      fragmentElementDataSchema,
      expressionElementDataSchema,
    ])
    .optional(),
  editors: z.record(z.record(z.any())).optional(),
});
