import { reconcileList } from "@elllphnt/elementa-kernel";
import type { ComponentElementInstance } from "@elllphnt/elementa-runtime";
import type { Observable } from "rxjs";
import { BehaviorSubject, map } from "rxjs";
import type { Scene } from "../../scene/scene.js";
import { ComponentRenderable } from "../component/component.js";
import type { Renderable } from "../renderable.js";
import { createElementRenderable } from "./_create.js";
import { ElementRenderable } from "./element.js";

export class ComponentElementRenderable extends ElementRenderable<ComponentElementInstance> {
  private _component$ = new BehaviorSubject<ComponentRenderable | undefined>(
    undefined
  );
  private _children$ = new BehaviorSubject<ElementRenderable[]>([]);

  get children$(): Observable<ElementRenderable[]> {
    return this._children$.asObservable();
  }
  get children(): ElementRenderable[] {
    return this._children$.value;
  }

  get component$() {
    return this._component$;
  }
  get component() {
    return this._component$.value;
  }

  get renderables() {
    const renderables: Renderable[] = [];
    if (this.component) {
      renderables.push(this.component);
    }
    return renderables;
  }
  get renderables$() {
    return this.component$.pipe(
      map((template) => {
        const renderables: Renderable[] = [];
        if (template) {
          renderables.push(template);
        }
        return renderables;
      })
    );
  }

  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: ComponentElementInstance;
  }) {
    super({ instance, scene });

    const templateSubscription = this.instance.component$.subscribe(
      (component) => {
        const currentComponent = this._component$.value;
        if (component) {
          const newComponent = new ComponentRenderable({
            scene: this.scene,
            instance: component,
          });
          this._component$.next(newComponent);
        } else {
          this._component$.next(undefined);
        }
        if (currentComponent) {
          currentComponent.dispose();
        }
      }
    );

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
      this.component?.dispose();
      templateSubscription.unsubscribe();
      this._component$.complete();
      this._component$.next(undefined);

      this._children$.complete();
      childrenSubscription.unsubscribe();
      this.children.forEach((child) => child.dispose());
    });
  }
}
