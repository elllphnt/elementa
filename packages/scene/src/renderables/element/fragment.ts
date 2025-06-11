import { FragmentElementInstance } from "@elllphnt/elementa-runtime";
import { BehaviorSubject, map } from "rxjs";
import { Scene } from "../../scene/scene.js";
import { FragmentRenderable } from "../fragment.js";
import { Renderable } from "../renderable.js";
import { ElementRenderable } from "./element.js";

export class FragmentElementRenderable extends ElementRenderable<FragmentElementInstance> {
  private _fragment$ = new BehaviorSubject<FragmentRenderable | undefined>(
    undefined
  );

  get fragment$() {
    return this._fragment$;
  }
  get fragment() {
    return this._fragment$.value;
  }

  get renderables() {
    const renderables: Renderable[] = [];
    if (this.fragment) {
      renderables.push(this.fragment);
    }
    return renderables;
  }
  get renderables$() {
    return this.fragment$.pipe(
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
    instance: FragmentElementInstance;
  }) {
    super({ instance, scene });

    const templateSubscription = this.instance.fragment$.subscribe(
      (fragment) => {
        const currentFragment = this._fragment$.value;
        if (fragment) {
          const newFragment = new FragmentRenderable({
            scene: this.scene,
            instance: fragment,
          });
          this._fragment$.next(newFragment);
        } else {
          this._fragment$.next(undefined);
        }
        if (currentFragment) {
          currentFragment.dispose();
        }
      }
    );

    this.addDisposer(() => {
      this.fragment?.dispose();
      templateSubscription.unsubscribe();
      this._fragment$.complete();
      this._fragment$.next(undefined);
    });
  }
}
