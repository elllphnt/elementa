import { App } from "@repo/elementa-models";
import { Disposable, updateMapList } from "@repo/utils";
import { BehaviorSubject } from "rxjs";
import { FragmentEnvironment } from "../_";
import { RouteInstance } from "./route";

export class AppInstance extends Disposable {
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  readonly key = `${AppInstance.keySeed}-${AppInstance.key++}`;

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
    super();
    this.app = app;

    const routeSubscription = this.app.routes$.subscribe((routes) => {
      const nextRoutes = updateMapList({
        targets: this.routes,
        sources: routes,
        ref: (r) => r.route,
        create: (route) => new RouteInstance({ environment, route }),
        dispose: (route) => route.dispose(),
      });
      this._routes$.next(nextRoutes);
    });

    this.addDisposer(() => {
      this._routes$.complete();
      routeSubscription.unsubscribe();
    });
  }
}
