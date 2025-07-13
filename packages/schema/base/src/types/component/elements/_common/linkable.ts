import { z } from "zod";
import type { ResolvableOrEvaluable } from "../../../_primitives/_.js";
import { resolvableOrEvaluableSchema } from "../../../_primitives/_.js";
import type { ElementRawAttribute } from "../_base.js";
import type { AccessibleData } from "./accessible.js";
import type { InteractiveData } from "./interactive.js";
import type { StylableData } from "./stylable.js";

// Types

export type LinkData = StylableData &
  InteractiveData &
  LinkableData &
  AccessibleData & {
    href?: ResolvableOrEvaluable<string>;
    params?: Record<string, ResolvableOrEvaluable>;
    query?: Record<string, ResolvableOrEvaluable>;
    state?: Record<string, ResolvableOrEvaluable>;
    hreflang?: ResolvableOrEvaluable<string>;
    ping?: ResolvableOrEvaluable<string[]>;
    referrerPolicy?: ResolvableOrEvaluable<string>;
    rel?: ResolvableOrEvaluable<string>;
    target?: ResolvableOrEvaluable<string>;
    raw?: ElementRawAttribute[];
  };

export type LinkableData = {
  link?: LinkData;
};

// Schemas

export const linkDataSchema = z.object({
  href: resolvableOrEvaluableSchema(z.string()).optional(),
  params: z.record(resolvableOrEvaluableSchema(z.string())).optional(),
  query: z.record(resolvableOrEvaluableSchema(z.string())).optional(),
  state: z.record(resolvableOrEvaluableSchema(z.string())).optional(),
  hreflang: resolvableOrEvaluableSchema(z.string()).optional(),
  ping: resolvableOrEvaluableSchema(z.array(z.string())).optional(),
  referrerPolicy: resolvableOrEvaluableSchema(z.string()).optional(),
  rel: resolvableOrEvaluableSchema(z.string()).optional(),
  target: resolvableOrEvaluableSchema(z.string()).optional(),
});

export const linkableDataSchema = z.object({
  link: linkDataSchema.optional(),
});
