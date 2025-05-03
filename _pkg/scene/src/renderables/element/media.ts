import { MediaElementInstance } from "@elllphnt/elementa-runtime";
import { of } from "rxjs";
import { Scene } from "../../scene/scene";
import { ElementRenderable } from "./element";

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
