import type { ExpressionElementInstance } from "@elllphnt/elementa-runtime";
import type { Scene } from "../../scene/scene.js";
import { ElementRenderable } from "./element.js";

export class ExpressionElementRenderable extends ElementRenderable<ExpressionElementInstance> {
  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: ExpressionElementInstance;
  }) {
    super({ instance, scene });
  }
}
