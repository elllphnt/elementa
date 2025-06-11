import { RenderingEnvironment } from "@elllphnt/elementa-core";
import * as y from "yjs";
import { CrdtComponentRenderableContent } from "./component.js";
import { CrdtFragmentRenderableContent } from "./fragment.js";
import { CrdtRouterRenderableContent } from "./router.js";

export type CrdtRenderableContent =
  | CrdtRouterRenderableContent
  | CrdtComponentRenderableContent
  | CrdtFragmentRenderableContent;

export function CrdtcreateRenderableContent({
  crdt,
  environment,
  initialized,
}: {
  crdt: y.Map<any>;
  environment: RenderingEnvironment;
  initialized?: boolean;
}): CrdtRenderableContent {
  const type = crdt.get("type");
  switch (type) {
    case "router":
      return new CrdtRouterRenderableContent({
        crdt,
        environment,
        initialized,
      });
    case "component":
      return new CrdtComponentRenderableContent({
        crdt,
        environment,
        initialized,
      });
    case "fragment":
      return new CrdtFragmentRenderableContent({
        crdt,
        environment,
        initialized,
      });
    default:
      throw new Error(`Unknown renderable content type: ${type}`);
  }
}
