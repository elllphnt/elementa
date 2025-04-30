import { AppInstance } from "@elllphnt/elementa-runtime";
import { reconcileList } from "@elllphnt/elementa-utils";
import { BehaviorSubject, Observable } from "rxjs";
import { Scene } from "../../scene/scene";
import { Renderable } from "../_";
import { RouteRenderable } from "./route";

export class AppRenderable extends Renderable {
  private _routes$ = new BehaviorSubject<RouteRenderable[]>([]);

  get routes$(): Observable<RouteRenderable[]> {
    return this._routes$;
  }
  get routes(): RouteRenderable[] {
    return this._routes$.value;
  }

  get renderables(): Renderable[] {
    return this.routes;
  }
  get renderables$(): Observable<Renderable[]> {
    return this.routes$;
  }

  constructor({ scene, instance }: { scene: Scene; instance: AppInstance }) {
    super({ scene });

    const routesSubscription = instance.routes$.subscribe((routes) => {
      const [nextRoutes, removed] = reconcileList({
        sources: routes,
        targets: this.routes,
        sourceRef: (r) => r,
        targetRef: (r) => r.route,
        create: (route) =>
          new RouteRenderable({
            scene,
            route,
          }),
      });

      this._routes$.next(nextRoutes);
      removed.forEach((r) => r.dispose());
    });

    this.addDisposer(() => {
      routesSubscription.unsubscribe();
    });
  }
}
