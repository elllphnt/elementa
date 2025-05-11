import { RenderableContentData } from "@elllphnt/elementa-base";
import * as y from "yjs";
import { Component } from "../../../component.js";
import { AppRenderableContent, attachAppRenderableContent } from "./app.js";
import {
  attachComponentRenderableContent,
  ComponentRenderableContent,
} from "./component.js";
import {
  attachFragmentRenderableContent,
  FragmentRenderableContent,
} from "./fragment.js";

export type RenderableContent =
  | AppRenderableContent
  | ComponentRenderableContent
  | FragmentRenderableContent;

export function createRenderableContent(
  ymap: y.Map<any>,
  component: Component
): ymap is RenderableContent {
  const type = ymap.get("type") as RenderableContentData["type"];
  switch (type) {
    case "component":
      return attachComponentRenderableContent(ymap, component.project);
    case "fragment":
      return attachFragmentRenderableContent(ymap, component);
    case "app":
      return attachAppRenderableContent(ymap, component.project);
    default:
      throw new Error(`Unknown renderable content type: ${type}`);
  }
}
