import { RenderableContent } from "@elllphnt/elementa-models";
import { FragmentEnvironment } from "../../../fragment/_.js";
import { AppRenderableContentInstance } from "./app.js";
import { ComponentRenderableContentInstance } from "./component.js";
import { FragmentRenderableContentInstance } from "./fragment.js";

export type RenderableContentInstance =
  | AppRenderableContentInstance
  | FragmentRenderableContentInstance
  | ComponentRenderableContentInstance;

export function createRenderableContentInstance({
  model,
  environment,
}: {
  model: RenderableContent;
  environment: FragmentEnvironment;
}) {
  switch (model.type) {
    case "app":
      return new AppRenderableContentInstance({
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
