import { App } from "@elllphnt/elementa-models";
import { reconcileList } from "@elllphnt/elementa-utils";
import { BehaviorSubject } from "rxjs";
import { FragmentEnvironment, Instance } from "../_";
import { RouteInstance } from "./route";

export class AppInstance extends Instance {
  readonly app: App;

  private _routes$ = new BehaviorSubject<RouteInstance[]>([]);

  get routes() {
    return this._routes$.value;
  }
  get routes$() {
    return this._routes$.asObservable();
  }

  constructor({
    environment,
    app,
  }: {
    environment: FragmentEnvironment;
    app: App;
  }) {
    super(environment.elementa);
    this.app = app;

    const routeSubscription = this.app.routes.observable$.subscribe(
      (routes) => {
        const nextRoutes = reconcileList({
          targets: this.routes,
          sources: routes,
          sourceRef: (r) => r,
          targetRef: (r) => r.route,
          create: (route) => new RouteInstance({ environment, route }),
          dispose: (route) => route.dispose(),
        });
        this._routes$.next(nextRoutes);
      }
    );

    this.addDisposer(() => {
      this._routes$.complete();
      routeSubscription.unsubscribe();
    });
  }
}
