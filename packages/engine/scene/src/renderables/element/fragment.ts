import { FragmentElementInstance } from "@elllphnt/elementa-runtime";
import { Scene } from "../../scene/scene.js";
import { ElementRenderable } from "./element.js";

export class FragmentElementRenderable extends ElementRenderable<FragmentElementInstance> {
  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: FragmentElementInstance;
  }) {
    super({ instance, scene });
  }
}
