import { App } from "@elllphnt/elementa-models";
import { reconcileList } from "@elllphnt/elementa-utils";
import { BehaviorSubject } from "rxjs";
import { FragmentEnvironment } from "../fragment/_";
import { Instance, InstanceType } from "../instance";
import { RouteTreeInstance } from "./route_tree";

export class AppInstance extends Instance {
  readonly app: App;

  private _routes$ = new BehaviorSubject<RouteTreeInstance[]>([]);

  get routes() {
    return this._routes$.value;
  }
  get routes$() {
    return this._routes$.asObservable();
  }

  constructor({
    app,
    environment,
    parent,
  }: {
    app: App;
    environment: FragmentEnvironment;
    parent?: Instance;
  }) {
    super({
      type: InstanceType.App,
      runtime: environment.runtime,
      parent,
    });
    this.app = app;

    const routeSubscription = this.app.routes.observable$.subscribe(
      (routes) => {
        const [nextRoutes, removed] = reconcileList({
          targets: this.routes,
          sources: routes,
          sourceRef: (r) => r,
          targetRef: (r) => r.model,
          create: (route) =>
            new RouteTreeInstance({
              environment,
              routeTree: route,
              parent: this,
            }),
        });
        this._routes$.next(nextRoutes);
        removed.forEach((route) => {
          route.dispose();
        });
      }
    );

    this.addDisposer(() => {
      this._routes$.complete();
      routeSubscription.unsubscribe();
    });
  }
}
