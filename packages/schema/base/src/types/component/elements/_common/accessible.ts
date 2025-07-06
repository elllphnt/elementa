import { z } from "zod";
import type {
  ResolvableOrEvaluable} from "../../../_primitives/_.js";
import {
  resolvableOrEvaluableSchema,
} from "../../../_primitives/_.js";

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
