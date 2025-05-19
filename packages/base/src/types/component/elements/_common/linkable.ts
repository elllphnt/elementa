import { z } from "zod";
import {
  ResolvableOrEvaluable,
  resolvableOrEvaluableSchema,
} from "../../../_primitives/_.js";
import { StylableData } from "./stylable.js";

// Types

export type BaseLinkData<T extends string> = StylableData & {
  type: T;
};

export type RouteLinkData = BaseLinkData<"route"> & {
  routeUrl?: string;
  params?: Record<string, ResolvableOrEvaluable<any>>;
  query?: Record<string, ResolvableOrEvaluable<any>>;
  state?: Record<string, ResolvableOrEvaluable<any>>;
};

export type HrefLinkData = BaseLinkData<"href"> & {
  href?: ResolvableOrEvaluable<string>;
  hreflang?: ResolvableOrEvaluable<string>;
  ping?: ResolvableOrEvaluable<string[]>;
  referrerPolicy?: ResolvableOrEvaluable<string>;
  rel?: ResolvableOrEvaluable<string>;
  target?: ResolvableOrEvaluable<string>;
};

export type LinkData = RouteLinkData | HrefLinkData;

export type LinkableData = {
  link?: LinkData;
};

// Schemas

const routeLinkDataSchema = z.object({
  type: z.literal("route"),
  routeUrl: z.string().optional(),
});

const hrefLinkDataSchema = z.object({
  type: z.literal("href"),
  href: resolvableOrEvaluableSchema(z.string()).optional(),
  hreflang: resolvableOrEvaluableSchema(z.string()).optional(),
  ping: resolvableOrEvaluableSchema(z.array(z.string())).optional(),
  referrerPolicy: resolvableOrEvaluableSchema(z.string()).optional(),
  rel: resolvableOrEvaluableSchema(z.string()).optional(),
  target: resolvableOrEvaluableSchema(z.string()).optional(),
});

export const linkDataSchema = z.union([
  routeLinkDataSchema,
  hrefLinkDataSchema,
]);

export const linkableDataSchema = z.object({
  link: linkDataSchema.optional(),
});
