import type { Instance } from "@elllphnt/elementa-runtime";
import type { Scene } from "../scene/scene.js";
import { Renderable } from "./renderable.js";

export abstract class InstanceRenderable<
  I extends Instance
> extends Renderable {
  readonly instance: I;

  constructor({ scene, instance }: { scene: Scene; instance: I }) {
    super({ scene });
    this.instance = instance;
  }
}
