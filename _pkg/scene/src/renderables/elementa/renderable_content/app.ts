import { AppRenderableContentInstance } from "@elllphnt/elementa-runtime";
import { createMemoryHistory } from "@tanstack/react-router";
import { BehaviorSubject } from "rxjs";
import { Scene } from "../../../scene/scene.js";
import { AppRenderable } from "../../app/app.js";
import { Renderable } from "../../renderable.js";

export class AppRenderableContentRenderable extends Renderable {
  readonly instance: AppRenderableContentInstance;
  private _appContent$ = new BehaviorSubject<AppRenderable | undefined>(
    undefined
  );

  get appContent() {
    return this._appContent$.value;
  }

  get appContent$() {
    return this._appContent$.asObservable();
  }

  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: AppRenderableContentInstance;
  }) {
    super({ scene });
    this.instance = instance;

    const appSubscription = instance.app$.subscribe((app) => {
      const current = this._appContent$.value;
      if (app) {
        this._appContent$.next(
          new AppRenderable({
            scene,
            instance: app,
            history: createMemoryHistory({ initialEntries: ["/"] }),
          })
        );
      } else {
        this._appContent$.next(undefined);
      }
      if (current) {
        current.dispose();
      }
    });

    this.addDisposer(() => {
      appSubscription.unsubscribe();
      this._appContent$.complete();
    });
  }
}
