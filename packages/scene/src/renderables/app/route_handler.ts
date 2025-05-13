import { PageRouteHandler } from "@elllphnt/elementa-runtime";
import { Route } from "@tanstack/react-router";
import { BehaviorSubject } from "rxjs";
import { Scene } from "../../scene/scene.js";
import { ComponentRenderable } from "../component/component.js";
import { InstanceRenderable } from "../instance.js";

export class RouteHandlerRenderable extends InstanceRenderable<PageRouteHandler> {
  private _children$ = new BehaviorSubject<RouteHandlerRenderable[]>([]);
  private _mainView$ = new BehaviorSubject<ComponentRenderable | undefined>(
    undefined
  );

  private _tsRoute: Route | undefined;

  get children$() {
    return this._children$.asObservable();
  }
  get children() {
    return this._children$.value;
  }

  get mainView$() {
    return this._mainView$.asObservable();
  }
  get mainView() {
    return this._mainView$.value;
  }

  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: PageRouteHandler;
  }) {
    super({ scene, instance });

    const mainViewSubscription = this.instance.mainView$.subscribe((view) => {
      const currentView = this._mainView$.value;
      if (view) {
        this._mainView$.next(
          new ComponentRenderable({
            scene,
            instance: view,
          })
        );
      } else {
        this._mainView$.next(undefined);
      }
      if (currentView) {
        currentView.dispose();
      }
    });

    this.addDisposer(() => {
      this._children$.complete();
      this._mainView$.complete();

      mainViewSubscription.unsubscribe();
    });
  }
}
