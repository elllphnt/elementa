import { reconcileList } from "@elllphnt/elementa-kernel";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import { Router } from "@elllphnt/elementa-models";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  switchMap,
} from "rxjs";
import { ElementRuntimeEnvironment } from "../elements/_environment/environment.js";
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
    environment: ElementRuntimeEnvironment;
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
