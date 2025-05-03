import { ComponentInstance } from "@elllphnt/elementa-runtime";
import { Observable, of } from "rxjs";
import { Scene } from "../../scene/scene";
import { Renderable } from "../_";
import { InstanceRenderable } from "../instance";

export class ComponentRenderable extends InstanceRenderable<ComponentInstance> {
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
  }
}
