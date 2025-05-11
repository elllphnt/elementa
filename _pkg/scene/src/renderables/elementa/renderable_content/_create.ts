import {
  AppRenderableContentInstance,
  ComponentRenderableContentInstance,
  FragmentRenderableContentInstance,
  RenderableContentInstance,
} from "@elllphnt/elementa-runtime";
import { Scene } from "../../../scene/scene.js";
import { AppRenderableContentRenderable } from "./app.js";
import { ComponentRenderableContentRenderable } from "./component.js";
import { FragmentRenderableContentRenderable } from "./fragment.js";

export type RenderableContentRenderable =
  | AppRenderableContentRenderable
  | ComponentRenderableContentRenderable
  | FragmentRenderableContentRenderable;

export function createRenderableContentRenderable({
  scene,
  instance,
}: {
  scene: Scene;
  instance: RenderableContentInstance;
}): RenderableContentRenderable {
  if (instance instanceof AppRenderableContentInstance) {
    return new AppRenderableContentRenderable({ scene, instance });
  } else if (instance instanceof ComponentRenderableContentInstance) {
    return new ComponentRenderableContentRenderable({ scene, instance });
  } else if (instance instanceof FragmentRenderableContentInstance) {
    return new FragmentRenderableContentRenderable({ scene, instance });
  } else {
    throw new Error(
      `Unknown renderable content instance type: ${
        (instance as RenderableContentInstance).model.type
      }`
    );
  }
}
