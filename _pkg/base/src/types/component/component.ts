import { FragmentData, StateData } from "../_.js";
import { DataInputData } from "../_shared/data_input.js";

export type ComponentData = {
  name?: string;
  props?: DataInputData[];
  template?: FragmentData;
  fragments?: FragmentData[];
  states?: StateData[];
  editors?: Record<string, Record<string, any>>;
};
