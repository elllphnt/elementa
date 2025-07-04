import type { ElementInstance } from "@elllphnt/elementa-runtime";
import type { Scene } from "../../scene/scene.js";
import { InstanceRenderable } from "../instance.js";

export abstract class ElementRenderable<
  I extends ElementInstance = ElementInstance
> extends InstanceRenderable<I> {
  constructor({ scene, instance }: { scene: Scene; instance: I }) {
    super({ instance, scene });
  }
}
