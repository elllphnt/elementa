import { ResolvableOrEvaluable } from "../../../_.js";

export type AccessibleData = {
  ariaLabel?: ResolvableOrEvaluable<string>;
  ariaHidden?: ResolvableOrEvaluable<boolean>;
  ariaRole?: ResolvableOrEvaluable<string>;
  tabIndex?: ResolvableOrEvaluable<number>;
};
