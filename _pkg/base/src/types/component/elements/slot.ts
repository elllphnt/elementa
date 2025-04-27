import { ProviderData } from "../_.js";
import { BaseElementData } from "./_base.js";
import { ElementData } from "./element.js";

export type SlotElementData = BaseElementData & {
  type: "slot";
  placeholder?: ElementData[];
  providers?: ProviderData[];
};
