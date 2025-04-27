import { Resolvable } from "../../_.js";
import { Evaluable } from "../../_primitives/dynamic/evaluable.js";
import { BaseStateData } from "./_base.js";

export type ValueStateData = BaseStateData & {
  type: "value";
  init?: Evaluable<any> | Resolvable<any>;
  tsType?: string;
};
