import { RouterRenderableContentInstance } from "@elllphnt/elementa-runtime";
import { createMemoryHistory } from "@tanstack/react-router";
import { BehaviorSubject } from "rxjs";
import { Scene } from "../../../scene/scene.js";
import { Renderable } from "../../renderable.js";
import { RouterRenderable } from "../../router/router.js";

export class RouterRenderableContentRenderable extends Renderable {
  readonly instance: RouterRenderableContentInstance;
  private _routerContent$ = new BehaviorSubject<RouterRenderable | undefined>(
    undefined
  );

  get routerContent() {
    return this._routerContent$.value;
  }

  get routerContent$() {
    return this._routerContent$.asObservable();
  }

  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: RouterRenderableContentInstance;
  }) {
    super({ scene });
    this.instance = instance;

    const routerSubscription = instance.router$.subscribe((router) => {
      const current = this._routerContent$.value;
      if (router) {
        this._routerContent$.next(
          new RouterRenderable({
            scene,
            instance: router,
            history: createMemoryHistory({ initialEntries: ["/"] }),
          })
        );
      } else {
        this._routerContent$.next(undefined);
      }
      if (current) {
        current.dispose();
      }
    });

    this.addDisposer(() => {
      routerSubscription.unsubscribe();
      this._routerContent$.complete();
    });
  }
}
