import type { FragmentRenderableContentInstance } from "@elllphnt/elementa-runtime";
import { BehaviorSubject } from "rxjs";
import type { Scene } from "../../../scene/scene.js";
import { FragmentRenderable } from "../../fragment.js";
import { Renderable } from "../../renderable.js";

export class FragmentRenderableContentRenderable extends Renderable {
  readonly instance: FragmentRenderableContentInstance;
  private _fragmentContent$ = new BehaviorSubject<
    FragmentRenderable | undefined
  >(undefined);

  get fragmentContent() {
    return this._fragmentContent$.value;
  }

  get fragmentContent$() {
    return this._fragmentContent$.asObservable();
  }

  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: FragmentRenderableContentInstance;
  }) {
    super({ scene });
    this.instance = instance;

    const fragmentSubscription = instance.fragment$.subscribe((fragment) => {
      const current = this._fragmentContent$.value;
      if (fragment) {
        this._fragmentContent$.next(
          new FragmentRenderable({
            scene,
            instance: fragment,
          })
        );
      } else {
        this._fragmentContent$.next(undefined);
      }
      if (current) {
        current.dispose();
      }
    });

    this.addDisposer(() => {
      fragmentSubscription.unsubscribe();
      this._fragmentContent$.complete();
    });
  }
}
