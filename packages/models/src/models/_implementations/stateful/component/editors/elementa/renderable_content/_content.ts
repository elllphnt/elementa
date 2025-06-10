import { RenderableContentData } from "@elllphnt/elementa-base";
import { Project } from "../../../../../../../infrastructure/_.js";
import { StatefulAppRenderableContent } from "./app.js";
import { StatefulComponentRenderableContent } from "./component.js";
import { StatefulFragmentRenderableContent } from "./fragment.js";

export type StatefulRenderableContent =
  | StatefulAppRenderableContent
  | StatefulComponentRenderableContent
  | StatefulFragmentRenderableContent;

export function StatefulcreateRenderableContent({
  init,
  project,
}: {
  init: RenderableContentData;
  project: Project;
}): StatefulRenderableContent {
  switch (init.type) {
    case "app":
      return new StatefulAppRenderableContent({ init, project });
    case "component":
      return new StatefulComponentRenderableContent({ init, project });
    case "fragment":
      return new StatefulFragmentRenderableContent({ init, project });
    default:
      throw new Error(`Unknown renderable content type: ${(init as any).type}`);
  }
}
