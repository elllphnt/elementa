import { ResolvableOrEvaluable } from "../../_.js";
import { BaseElementData } from "./_base.js";
import { ElementContainerData } from "./_common/container.js";
import { InteractiveData } from "./_common/interactive.js";
import { StylableData } from "./_common/stylable.js";

export type SlotFillData = StylableData &
  InteractiveData &
  ElementContainerData & {};

export type ComponentElementData = BaseElementData & {
  type: "component";
  componentUrl?: string;
  props?: Record<string, ResolvableOrEvaluable<any>>;
  fills?: Record<string, SlotFillData>;
};
