import { Router } from "@elllphnt/elementa-core";
import { combineLatestOrEmpty, reconcileList } from "@elllphnt/elementa-utils";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  switchMap,
} from "rxjs";
import { FragmentEnvironment } from "../fragment/_.js";
import { ElementaInstanceType, Instance } from "../instance.js";
import { RouteTreeInstance } from "./route_tree/route_tree.js";

export class RouterInstance extends Instance {
  readonly router: Router;

  private _routes$ = new BehaviorSubject<RouteTreeInstance[]>([]);

  get routes() {
    return this._routes$.value;
  }
  get routes$() {
    return this._routes$.asObservable();
  }

  get diagnosticLevel(): number {
    return Math.max(
      this.ownDiagnosticLevel,
      ...this.routes.map((r) => r.diagnosticLevel)
    );
  }
  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.routes$.pipe(
        switchMap((routes) =>
          combineLatestOrEmpty(routes.map((r) => r.diagnosticLevel$))
        )
      ),
    ]).pipe(map(([own, routes]) => Math.max(own, ...routes)));
  }

  constructor({
    model,
    parent,
    environment,
  }: {
    model: Router;
    parent?: Instance;
    environment: FragmentEnvironment;
  }) {
    super({
      type: ElementaInstanceType.App,
      runtime: environment.runtime,
      parent,
    });
    this.router = model;

    const routeSubscription = this.router.routes$.subscribe((routes) => {
      const [nextRoutes, removed] = reconcileList({
        targets: this.routes,
        sources: routes,
        sourceRef: (r) => r,
        targetRef: (r) => r.model,
        create: (route) =>
          new RouteTreeInstance({
            environment,
            model: route,
            parent: this,
          }),
      });
      this._routes$.next(nextRoutes);
      removed.forEach((route) => {
        route.dispose();
      });
    });

    this.addDisposer(() => {
      this._routes$.complete();
      routeSubscription.unsubscribe();
    });
  }
}
