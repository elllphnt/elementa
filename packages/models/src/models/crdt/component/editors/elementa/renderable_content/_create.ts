import { RenderableContentData } from "@elllphnt/elementa-base";
import * as y from "yjs";
import { Project } from "../../../../../../infrastructure/_.js";
import { RenderableContent } from "../../../../../_interfaces/_.js";
import { attachAppRenderableContent } from "./app.js";
import { attachComponentRenderableContent } from "./component.js";
import { attachFragmentRenderableContent } from "./fragment.js";

export function attachRenderableContent(
  ymap: y.Map<any>,
  project: Project
): ymap is y.Map<any> & RenderableContent {
  const type = ymap.get("type") as RenderableContentData["type"];
  switch (type) {
    case "component":
      return attachComponentRenderableContent(ymap, project);
    case "fragment":
      return attachFragmentRenderableContent(ymap, project);
    case "app":
      return attachAppRenderableContent(ymap, project);
    default:
      throw new Error(`Unknown renderable content type: ${type}`);
  }
}
