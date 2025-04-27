import { Resolvable } from "../_primitives/dynamic/resolvable.js";

export type DataInputData = {
  name: string;
  varName?: string;
  tsType?: string;
  required?: boolean;
  default?: Resolvable<any>;
};
