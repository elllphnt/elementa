import { reconcileList } from "@elllphnt/elementa-kernel";
import { debounce } from "@elllphnt/elementa-lang-utils";
import { RouterInstance } from "@elllphnt/elementa-runtime";
import {
  createRootRoute,
  RootRoute,
  Route,
  RouterHistory,
} from "@tanstack/react-router";
import { BehaviorSubject, Observable } from "rxjs";
import { Scene } from "../../scene/scene.js";
import { Renderable } from "../renderable.js";
import { RouteTreeRenderable } from "./route.js";

export class RouterRenderable extends Renderable {
  readonly instance: RouterInstance;
  readonly history: RouterHistory;

  private _routes$ = new BehaviorSubject<RouteTreeRenderable[]>([]);
  private _tsRootRoute$ = new BehaviorSubject<RootRoute | undefined>(undefined);

  get routes$(): Observable<RouteTreeRenderable[]> {
    return this._routes$;
  }
  get routes(): RouteTreeRenderable[] {
    return this._routes$.value;
  }

  get tsRootRoute$(): Observable<RootRoute | undefined> {
    return this._tsRootRoute$;
  }
  get tsRootRoute(): RootRoute | undefined {
    return this._tsRootRoute$.value;
  }

  get renderables(): Renderable[] {
    return this.routes;
  }
  get renderables$(): Observable<Renderable[]> {
    return this.routes$;
  }

  constructor({
    scene,
    instance,
    history,
  }: {
    scene: Scene;
    instance: RouterInstance;
    history: RouterHistory;
  }) {
    super({ scene });
    this.instance = instance;
    this.history = history;

    const onStructure = debounce(() => {
      this.handleStructureChange();
    }, 100);

    const routesSubscription = this.instance.routes$.subscribe((routes) => {
      const [nextRoutes, removed] = reconcileList({
        sources: routes,
        targets: this.routes,
        sourceRef: (r) => r,
        targetRef: (r) => r.instance,
        create: (route) =>
          new RouteTreeRenderable({
            scene,
            route,
            onStructure,
          }),
      });

      this._routes$.next(nextRoutes);
      removed.forEach((r) => r.dispose());
    });

    onStructure();

    this.addDisposer(() => {
      routesSubscription.unsubscribe();
    });
  }

  handleStructureChange() {
    const rootRoute = createRootRoute();
    const routes: Route[] = [];

    for (const route of this.routes) {
      const tsRoute = route.createTsRoute(rootRoute);
      if (tsRoute) {
        routes.push(tsRoute);
      }
    }
    rootRoute.addChildren(routes);
    this._tsRootRoute$.next(rootRoute);
  }
}
