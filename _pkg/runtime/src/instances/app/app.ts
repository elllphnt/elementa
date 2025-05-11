import { App } from "@elllphnt/elementa-models";
import { reconcileList } from "@elllphnt/elementa-utils";
import { BehaviorSubject } from "rxjs";
import { ElementaInstanceType, Instance } from "../instance.js";
import { AppInputResolver } from "./input_resolver/_.js";
import { RouteTreeInstance } from "./route_tree.js";

export class AppInstance extends Instance {
  readonly app: App;
  readonly inputResolver: AppInputResolver;

  private _routes$ = new BehaviorSubject<RouteTreeInstance[]>([]);

  get routes() {
    return this._routes$.value;
  }
  get routes$() {
    return this._routes$.asObservable();
  }

  constructor({
    app,
    inputResolver,
    parent,
  }: {
    app: App;
    inputResolver: AppInputResolver;
    parent?: Instance;
  }) {
    super({
      type: ElementaInstanceType.App,
      runtime: inputResolver.environment.runtime,
      parent,
    });
    this.app = app;
    this.inputResolver = inputResolver;

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
