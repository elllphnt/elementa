import { ResolvableOrEvaluable } from "../../../_.js";

export type RouteLinkData = {
  type: "route";
  routeUrl?: string;
};
export type HrefLinkData = {
  type: "href";
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
