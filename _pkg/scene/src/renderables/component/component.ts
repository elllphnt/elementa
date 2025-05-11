import { ComponentInstance } from "@elllphnt/elementa-runtime";
import { Observable, of } from "rxjs";
import { Scene } from "../../scene/scene.js";
import { FragmentRenderable } from "../fragment.js";
import { InstanceRenderable } from "../instance.js";
import { Renderable } from "../renderable.js";

export class ComponentRenderable extends InstanceRenderable<ComponentInstance> {
  readonly template: FragmentRenderable;

  get renderables(): Renderable[] {
    return [];
  }
  get renderables$(): Observable<Renderable[]> {
    return of([]);
  }

  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: ComponentInstance;
  }) {
    super({ scene, instance });
    this.template = new FragmentRenderable({
      scene: this.scene,
      instance: this.instance.template,
    });
  }
}
