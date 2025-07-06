import { z } from "zod";
import type { DataInputData} from "../_shared/data_input.js";
import { dataInputDataSchema } from "../_shared/data_input.js";
import type {
  ElementData} from "./elements/_.js";
import {
  expressionElementDataSchema,
  fragmentElementDataSchema,
} from "./elements/_.js";
import type { FragmentData} from "./fragment.js";
import { fragmentDataSchema } from "./fragment.js";
import type { StateData} from "./states/_.js";
import { stateDataSchema } from "./states/_.js";

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
