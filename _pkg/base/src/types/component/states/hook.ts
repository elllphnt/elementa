import { Resolvable } from "../../_.js";
import { Evaluable } from "../../_primitives/dynamic/evaluable.js";
import { BaseStateData } from "./_base.js";

export type HookStateData = BaseStateData & {
  type: "hook";
  hookUrl?: string;
  args?: (Evaluable<any> | Resolvable<any>)[];
};
