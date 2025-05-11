import { VectorElementInstance } from "@elllphnt/elementa-runtime";
import { of } from "rxjs";
import { Scene } from "../../scene/scene.js";
import { ElementRenderable } from "./element.js";

export class VectorElementRenderable extends ElementRenderable<VectorElementInstance> {
  get renderables() {
    return [];
  }
  get renderables$() {
    return of([]);
  }

  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: VectorElementInstance;
  }) {
    super({ scene, instance });
  }
}
