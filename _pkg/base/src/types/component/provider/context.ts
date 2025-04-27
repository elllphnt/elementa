import { Evaluable, Resolvable } from "../../_.js";
import { BaseProviderData } from "./_base.js";

export type ContextProviderData = BaseProviderData & {
  contextUrl?: string;
  value?: Evaluable<any> | Resolvable<any>;
};
