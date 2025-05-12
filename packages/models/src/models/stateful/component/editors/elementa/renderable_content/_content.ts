import { RenderableContentData } from "@elllphnt/elementa-base";
import { Project } from "../../../../../../infrastructure/_.js";
import { AppRenderableContentModel } from "./app.js";
import { ComponentRenderableContentModel } from "./component.js";
import { FragmentRenderableContentModel } from "./fragment.js";

export type RenderableContentModel =
  | AppRenderableContentModel
  | ComponentRenderableContentModel
  | FragmentRenderableContentModel;

export function createRenderableContentModel({
  init,
  project,
}: {
  init: RenderableContentData;
  project: Project;
}): RenderableContentModel {
  switch (init.type) {
    case "app":
      return new AppRenderableContentModel({ init, project });
    case "component":
      return new ComponentRenderableContentModel({ init, project });
    case "fragment":
      return new FragmentRenderableContentModel({ init, project });
    default:
      throw new Error(`Unknown renderable content type: ${(init as any).type}`);
  }
}
