import { ComponentElementInstance } from "@elllphnt/elementa-runtime";
import { BehaviorSubject, map } from "rxjs";
import { Scene } from "../../scene/scene.js";
import { ComponentRenderable } from "../component/component.js";
import { Renderable } from "../renderable.js";
import { ElementRenderable } from "./element.js";

export class ComponentElementRenderable extends ElementRenderable<ComponentElementInstance> {
  private _component$ = new BehaviorSubject<ComponentRenderable | undefined>(
    undefined
  );

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

    this.addDisposer(() => {
      this.component?.dispose();
      templateSubscription.unsubscribe();
      this._component$.complete();
      this._component$.next(undefined);
    });
  }
}
