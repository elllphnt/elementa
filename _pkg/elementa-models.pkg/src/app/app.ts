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

export class App extends Disposable {
  readonly id: string;
  readonly project: Project;

  private _routes$ = new BehaviorSubject<Record<string, Route>>({});

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

  get data(): AppData {
    return {
      routes: this.routes.map((route) => route.data),
    };
  }
  get data$(): Observable<AppData> {
    return combineLatestOrEmpty([
      this.routes$.pipe(
        switchMap((routes) =>
          combineLatestOrEmpty(routes.map((route) => route.data$)),
        ),
      ),
    ]).pipe(
      map(([routes]) => {
        return {
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

  addRoute(route: Route) {
    this._routes$.next({
      ...this._routes$.value,
      [route.id]: route,
    });
  }

  restore(data: AppData) {
    restoreReactiveMap({
      datafiable$: this._routes$,
      data: Object.fromEntries(
        data.routes?.map((route) => [route.id, route]) || [],
      ),
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
