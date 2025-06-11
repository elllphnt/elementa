import {
  ComponentInstance,
  ExpressionElementInstance,
  FragmentElementInstance,
} from "@elllphnt/elementa-runtime";
import { BehaviorSubject, Observable, of } from "rxjs";
import { Scene } from "../../scene/scene.js";
import {
  ExpressionElementRenderable,
  FragmentElementRenderable,
} from "../element/_.js";
import { InstanceRenderable } from "../instance.js";
import { Renderable } from "../renderable.js";

export class ComponentRenderable extends InstanceRenderable<ComponentInstance> {
  private _template$ = new BehaviorSubject<
    ExpressionElementRenderable | FragmentElementRenderable | undefined
  >(undefined);

  get template() {
    return this._template$.value;
  }
  get template$() {
    return this._template$.asObservable();
  }

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

    const templateSubscription = this.instance.template$.subscribe(
      (template) => {
        const prev = this._template$.value;
        if (template) {
          switch (template.type) {
            case "fragment": {
              this._template$.next(
                new FragmentElementRenderable({
                  scene: this.scene,
                  instance: template as FragmentElementInstance,
                })
              );
              break;
            }
            case "expression": {
              this._template$.next(
                new ExpressionElementRenderable({
                  scene: this.scene,
                  instance: template as ExpressionElementInstance,
                })
              );
              break;
            }
          }
        } else {
          this._template$.next(undefined);
        }
        prev?.dispose();
      }
    );

    this.addDisposer(() => {
      templateSubscription.unsubscribe();
    });
  }
}
