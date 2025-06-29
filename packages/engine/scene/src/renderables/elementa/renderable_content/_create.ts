import {
  ComponentRenderableContentInstance,
  FragmentRenderableContentInstance,
  RenderableContentInstance,
  RouterRenderableContentInstance,
} from "@elllphnt/elementa-runtime";
import { Scene } from "../../../scene/scene.js";
import { ComponentRenderableContentRenderable } from "./component.js";
import { FragmentRenderableContentRenderable } from "./fragment.js";
import { RouterRenderableContentRenderable } from "./router.js";

export type RenderableContentRenderable =
  | RouterRenderableContentRenderable
  | ComponentRenderableContentRenderable
  | FragmentRenderableContentRenderable;

export function createRenderableContentRenderable({
  scene,
  instance,
}: {
  scene: Scene;
  instance: RenderableContentInstance;
}): RenderableContentRenderable {
  if (instance instanceof RouterRenderableContentInstance) {
    return new RouterRenderableContentRenderable({ scene, instance });
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
