import { AppData } from "@elllphnt/elll-element";
import {
  combineLatestOrEmpty,
  Disposable,
  restoreReactiveMap,
} from "@repo/utils";
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  Observable,
  switchMap,
} from "rxjs";
import { genId } from "../_lib/id";
import { Project } from "../project/_";
import { Route } from "./route";

export type AppModelState = Omit<AppData, "routes">;
export class App extends Disposable {
  readonly id: string;
  readonly project: Project;

  private _state$ = new BehaviorSubject<AppModelState>({});
  private _routes$ = new BehaviorSubject<Record<string, Route>>({});

  get state(): AppModelState {
    return this._state$.value;
  }
  get state$(): Observable<AppModelState> {
    return this._state$.asObservable();
  }

  get routes(): Route[] {
    return Object.values(this._routes$.value);
  }
  get routes$(): Observable<Route[]> {
    return this._routes$.asObservable().pipe(
      distinctUntilChanged((a, b) => {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        return (
          aKeys.length === bKeys.length &&
          aKeys.every((key) => a[key] === b[key])
        );
      }),
      map((routes) => Object.values(routes)),
    );
  }

  route(id: string) {
    return this._routes$.value[id];
  }
  route$(id: string) {
    return this._routes$.pipe(map((routes) => routes[id]));
  }

  get data(): AppData {
    return {
      ...this.state,
      routes: this.routes.map((route) => route.data),
    };
  }
  get data$(): Observable<AppData> {
    return combineLatestOrEmpty([
      this.state$,
      this.routes$.pipe(
        switchMap((routes) =>
          combineLatestOrEmpty(routes.map((route) => route.data$)),
        ),
      ),
    ]).pipe(
      map(([state, routes]) => {
        return {
          ...state,
          routes,
        };
      }),
    );
  }

  constructor({ id, project }: { id?: string; project: Project }) {
    super();

    this.id = id || genId();
    this.project = project;

    this.addDisposer(() => {
      Object.values(this._routes$.value).forEach((route) => {
        route.dispose();
      });
      this._routes$.complete();
    });
  }

  update(data: Partial<AppModelState>) {
    this._state$.next({
      ...this._state$.value,
      ...data,
    });
  }

  addRoute(route: Route) {
    this._routes$.next({
      ...this._routes$.value,
      [route.id]: route,
    });
  }
  createRoute() {
    const route = new Route({
      id: genId(),
      app: this,
    });
    return route;
  }
  removeRoutes(ids: string[]) {
    const routes = { ...this._routes$.value };
    const deleted: Route[] = [];
    for (const id of ids) {
      const route = routes[id];
      if (route) {
        route.dispose();
        delete routes[id];
        deleted.push(route);
      }
    }
    this._routes$.next(routes);
    return deleted;
  }

  restore({ routes, ...modelData }: AppData) {
    this._state$.next(modelData);
    restoreReactiveMap({
      datafiable$: this._routes$,
      data: Object.fromEntries(routes?.map((route) => [route.id, route]) || []),
      create: (data) =>
        new Route({
          id: data.id,
          app: this,
        }),
      restore: (route, data) => {
        route.restore(data);
      },
      dispose: (route) => {
        route.dispose();
      },
    });
  }
}
