import {
  InteractiveData,
  ResolvableOrEvaluable,
  StylableData,
} from "../../_.js";
import { BaseElementData } from "./_base.js";
import { ElementContainerData } from "./_common/container.js";

export type PrimitiveSubElementData = StylableData & InteractiveData & {};

export type PrimitiveElementData = BaseElementData &
  ElementContainerData & {
    type: "primitive";
    primitiveUrl?: string;
    props?: Record<string, ResolvableOrEvaluable<any>>;
    elements?: Record<string, PrimitiveSubElementData>;
  };
