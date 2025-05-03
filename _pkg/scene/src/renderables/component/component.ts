import { ComponentInstance } from "@elllphnt/elementa-runtime";
import { Observable, of } from "rxjs";
import { Scene } from "../../scene/scene";
import { FragmentRenderable } from "../fragment";
import { InstanceRenderable } from "../instance";
import { Renderable } from "../renderable";

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
