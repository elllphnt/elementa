import { z } from "zod";
import {
  ResolvableOrEvaluable,
  resolvableOrEvaluableSchema,
} from "../../../_primitives/_";

// Types

export type AccessibleData = {
  ariaLabel?: ResolvableOrEvaluable<string>;
  ariaHidden?: ResolvableOrEvaluable<boolean>;
  ariaRole?: ResolvableOrEvaluable<string>;
  tabIndex?: ResolvableOrEvaluable<number>;
};

// Schemas

export const accessibleDataSchema = z.object({
  ariaLabel: resolvableOrEvaluableSchema(z.string()).optional(),
  ariaHidden: resolvableOrEvaluableSchema(z.boolean()).optional(),
  ariaRole: resolvableOrEvaluableSchema(z.string()).optional(),
  tabIndex: resolvableOrEvaluableSchema(z.number()).optional(),
});
