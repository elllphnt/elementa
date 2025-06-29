import { RecordState } from "@elllphnt/elementa-kernel";
import { ElementaEnvironment } from "../environment.js";
import { ComponentRenderableContent } from "./component.js";
import { FragmentRenderableContent } from "./fragment.js";
import { RouterRenderableContent } from "./router.js";

export type RenderableContent =
  | RouterRenderableContent
  | ComponentRenderableContent
  | FragmentRenderableContent;

export function createRenderableContent({
  state,
  environment,
}: {
  state: RecordState<any>;
  environment: ElementaEnvironment;
}): RenderableContent {
  const type = state.entry("type");
  switch (type) {
    case "router":
      return new RouterRenderableContent({
        state,
        environment,
      });
    case "component":
      return new ComponentRenderableContent({
        state,
        environment,
      });
    case "fragment":
      return new FragmentRenderableContent({
        state,
        environment,
      });
    default:
      throw new Error(`Unknown renderable content type: ${type}`);
  }
}
