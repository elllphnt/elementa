import { reconcileList } from "@elllphnt/elementa-kernel";
import type { ContainerElementInstance } from "@elllphnt/elementa-runtime";
import type { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import type { Scene } from "../../scene/scene.js";
import { createElementRenderable } from "./_create.js";
import { ElementRenderable } from "./element.js";

export class ContainerElementRenderable extends ElementRenderable<ContainerElementInstance> {
  private _children$ = new BehaviorSubject<ElementRenderable[]>([]);

  get children$(): Observable<ElementRenderable[]> {
    return this._children$.asObservable();
  }
  get children(): ElementRenderable[] {
    return this._children$.value;
  }

  get renderables(): ElementRenderable[] {
    return this.children;
  }
  get renderables$(): Observable<ElementRenderable[]> {
    return this.children$;
  }

  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: ContainerElementInstance;
  }) {
    super({ scene, instance });

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
