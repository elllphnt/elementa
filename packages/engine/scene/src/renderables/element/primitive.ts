import { reconcileList } from "@elllphnt/elementa-kernel";
import type { PrimitiveElementInstance } from "@elllphnt/elementa-runtime";
import type { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import type { Scene } from "../../scene/scene.js";
import type { Renderable } from "../renderable.js";
import { createElementRenderable } from "./_create.js";
import { ElementRenderable } from "./element.js";

export class PrimitiveElementRenderable extends ElementRenderable<PrimitiveElementInstance> {
  private _children$ = new BehaviorSubject<ElementRenderable[]>([]);

  get children$(): Observable<ElementRenderable[]> {
    return this._children$.asObservable();
  }
  get children(): ElementRenderable[] {
    return this._children$.value;
  }

  get renderables() {
    return this.children as Renderable[];
  }
  get renderables$() {
    return this.children$ as Observable<Renderable[]>;
  }

  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: PrimitiveElementInstance;
  }) {
    super({ instance, scene });

    const childrenSubscription = this.instance.content$.subscribe(
      (children) => {
        const [newChildren, removed] = reconcileList({
          sources: children,
          targets: this.children,
          sourceRef: (s) => s,
          targetRef: (t) => t.instance,
          create: (instance) => createElementRenderable({ scene, instance }),
        });
        this._children$.next(newChildren);
        removed.forEach((s) => s.dispose());
      }
    );

    this.addDisposer(() => {
      this._children$.complete();
      childrenSubscription.unsubscribe();
      this.children.forEach((child) => child.dispose());
    });
  }
}
