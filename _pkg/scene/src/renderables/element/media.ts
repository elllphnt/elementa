import { MediaElementInstance } from "@elllphnt/elementa-runtime";
import { of } from "rxjs";
import { Scene } from "../../scene/scene.js";
import { ElementRenderable } from "./element.js";

export class MediaElementRenderable extends ElementRenderable<MediaElementInstance> {
  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: MediaElementInstance;
  }) {
    super({ scene, instance });
  }

  get renderables() {
    return [];
  }
  get renderables$() {
    return of([]);
  }
}
