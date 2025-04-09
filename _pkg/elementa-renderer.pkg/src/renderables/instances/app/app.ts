import { AppInstance } from "@repo/elementa";
import { combineLatestOrEmpty, updateMapList } from "@repo/utils";
import { BehaviorSubject, Observable, map, switchMap } from "rxjs";
import { ElementaRenderer } from "~/src/elementa_renderer";
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

  get tree() {
    return {
      routes: this.routes.map((route) => route.tree),
    };
  }
  get tree$() {
    return this.routes$.pipe(
      switchMap((routes) =>
        combineLatestOrEmpty(routes.map((route) => route.tree$)),
      ),
      map((routes) => ({ routes })),
    );
  }

  constructor({
    renderer,
    instance,
  }: {
    renderer: ElementaRenderer;
    instance: AppInstance;
  }) {
    super({ renderer });

    const routesSubscription = instance.routes$.subscribe((routes) => {
      const nextRoutes = updateMapList({
        targets: this.routes,
        sources: routes,
        create: (route) => {
          return new RouteRenderable({ renderer, instance: route });
        },
        dispose: (route) => {
          route.dispose();
        },
        ref: (route) => route.instance,
      });

      this._routes$.next(nextRoutes);
    });

    this.addDisposer(() => {
      routesSubscription.unsubscribe();
    });
  }
}
