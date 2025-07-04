import type { RenderableContent } from "@elllphnt/elementa-models";
import type { ElementRuntimeEnvironment } from "~/instances/elements/_environment/environment.js";
import { ComponentRenderableContentInstance } from "./component.js";
import { FragmentRenderableContentInstance } from "./fragment.js";
import { RouterRenderableContentInstance } from "./router.js";

export type RenderableContentInstance =
  | RouterRenderableContentInstance
  | FragmentRenderableContentInstance
  | ComponentRenderableContentInstance;

export function createRenderableContentInstance({
  model,
  environment,
}: {
  model: RenderableContent;
  environment: ElementRuntimeEnvironment;
}) {
  switch (model.type) {
    case "router":
      return new RouterRenderableContentInstance({
        model,
        environment,
      });
    case "fragment":
      return new FragmentRenderableContentInstance({
        model,
        environment,
      });
    case "component":
      return new ComponentRenderableContentInstance({
        model,
        environment,
      });
    default:
      throw new Error(
        `Unknown renderable content type: ${(model as any).type}`
      );
  }
}
