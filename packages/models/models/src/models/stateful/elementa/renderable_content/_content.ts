import { RenderableContentData } from "@elllphnt/elementa-base";
import { ElementaEnvironment } from "@elllphnt/elementa-core";
import { StatefulComponentRenderableContent } from "./component.js";
import { StatefulFragmentRenderableContent } from "./fragment.js";
import { StatefulRouterRenderableContent } from "./router.js";

export type StatefulRenderableContent =
  | StatefulRouterRenderableContent
  | StatefulComponentRenderableContent
  | StatefulFragmentRenderableContent;

export function StatefulcreateRenderableContent({
  init,
  environment,
}: {
  init: RenderableContentData;
  environment: ElementaEnvironment;
}): StatefulRenderableContent {
  switch (init.type) {
    case "router":
      return new StatefulRouterRenderableContent({
        init,
        environment,
      });
    case "component":
      return new StatefulComponentRenderableContent({
        init,
        environment,
      });
    case "fragment":
      return new StatefulFragmentRenderableContent({
        init,
        environment,
      });
    default:
      throw new Error(`Unknown renderable content type: ${(init as any).type}`);
  }
}
