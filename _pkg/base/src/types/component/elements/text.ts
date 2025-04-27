import {
  InteractiveData,
  LinkableData,
  ResolvableOrEvaluable,
  StylableData,
} from "../../_.js";
import { BaseElementData } from "./_base.js";

export type TextMarkData = StylableData &
  LinkableData &
  InteractiveData & {
    tag?: string;
  };

export type TextElementData = BaseElementData & {
  type: "text";
  text?: ResolvableOrEvaluable<string>;
  marks?: TextMarkData[];
};
