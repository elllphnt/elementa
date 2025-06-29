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
import { FragmentRenderable } from "../fragment.js";
import { InstanceRenderable } from "../instance.js";
import { Renderable } from "../renderable.js";

export class ComponentRenderable extends InstanceRenderable<ComponentInstance> {
  private _template$ = new BehaviorSubject<
    ExpressionElementRenderable | FragmentElementRenderable | undefined
  >(undefined);
  private _fragments$ = new BehaviorSubject<FragmentRenderable[]>([]);

  get template() {
    return this._template$.value;
  }
  get template$() {
    return this._template$.asObservable();
  }

  get fragments(): FragmentRenderable[] {
    return this._fragments$.value;
  }
  get fragments$(): Observable<FragmentRenderable[]> {
    return this._fragments$.asObservable();
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
          switch (template.element.type) {
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

    const fragmentsSubscription = this.instance.fragments$.subscribe(
      (fragments) => {
        const newFragments = fragments.map(
          (fragment) =>
            new FragmentRenderable({
              scene: this.scene,
              instance: fragment,
            })
        );
        this._fragments$.next(newFragments);
      }
    );

    this.addDisposer(() => {
      templateSubscription.unsubscribe();
      fragmentsSubscription.unsubscribe();
    });
  }
}
