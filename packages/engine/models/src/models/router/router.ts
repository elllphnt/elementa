import { genId, RouterData, RouteTreeData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  Model,
  RecordState,
} from "@elllphnt/elementa-kernel";
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  Observable,
  of,
} from "rxjs";
import { File } from "~/project/file/file.js";
import { Blueprint } from "../blueprint/blueprint.js";
import { ElementaEnvironment } from "../elementa/environment.js";
import { ElementaPreview } from "../elementa/preview.js";
import { RouteTree } from "./route_tree.js";

export class RouterElementaEnvironment implements ElementaEnvironment {
  router: Router;
  get project() {
    return this.router.file.project;
  }

  get hostUrl(): string | undefined {
    return this.router.file.url;
  }

  fragment() {
    return undefined;
  }
  fragment$() {
    return of(undefined);
  }

  constructor({ router }: { router: Router }) {
    this.router = router;
  }
  get defaultRouterUrl(): string | undefined {
    throw new Error("Method not implemented.");
  }
}

export class Router extends Model<RecordState<any>> {
  readonly file: File;
  readonly blueprint: Blueprint;
  readonly elementaEnvironment: ElementaEnvironment;
  readonly preview: ElementaPreview;

  private readonly _routes: AggregatedModelList<
    RecordState<RouteTreeData>,
    RouteTree
  >;
  private readonly _routesById$ = new BehaviorSubject<
    Record<string, RouteTree>
  >({});

  constructor({
    state,
    file,
    initialized,
  }: {
    state: RecordState<RouterData>;
    file: File;
    initialized?: boolean;
  }) {
    super({ state });
    this.file = file;

    const editorsState = state.getAggregatedStateRecord("editors");
    this.blueprint = new Blueprint({
      state: editorsState.entry("bleuprint", true),
    });
    this.elementaEnvironment = new RouterElementaEnvironment({
      router: this,
    });
    this.preview = new ElementaPreview({
      state: editorsState.entry("preview", true),
      environment: this.elementaEnvironment,
    });

    this._routes = new AggregatedModelList({
      state: state.getAggregatedStateList("routes"),
      create: (state, init) =>
        new RouteTree({
          state,
          router: this,
          initialized: init || initialized,
        }),
    });

    // reactive index
    const sub = this._routes.models$.subscribe((routes) => {
      const byId: Record<string, RouteTree> = {};
      const recurse = (list: RouteTree[]) => {
        for (const route of list) {
          byId[route.id] = route;
          recurse(route.children);
        }
      };
      recurse(routes);
      this._routesById$.next(byId);
    });

    this.addDisposer(() => {
      this._routes.dispose();
      this._routesById$.complete();
      sub.unsubscribe();
    });
  }

  get routes(): RouteTree[] {
    return this._routes.models;
  }

  get routes$(): Observable<RouteTree[]> {
    return this._routes.models$;
  }

  createRoute(init: Omit<RouteTreeData, "id" | "children">): RouteTree {
    const state = this.state.getRecordState("routes");
    state.set("id", genId());
    if (init.path != undefined) {
      state.set("path", init.path);
    }
    if (init.mainViewUrl != undefined) {
      state.set("mainViewUrl", init.mainViewUrl);
    }
    if (init.errorViewUrl != undefined) {
      state.set("errorViewUrl", init.errorViewUrl);
    }
    if (init.pendingViewUrl != undefined) {
      state.set("pendingViewUrl", init.pendingViewUrl);
    }
    if (init.notFoundViewUrl != undefined) {
      state.set("notFoundViewUrl", init.notFoundViewUrl);
    }
    if (init.loaderUrl != undefined) {
      state.set("loaderUrl", init.loaderUrl);
    }
    if (init.handlerUrl != undefined) {
      state.set("handlerUrl", init.handlerUrl);
    }

    return new RouteTree({ state, router: this, initialized: true });
  }

  addRoutes(routes: RouteTree[]): void {
    this._routes.add(routes[0]); // TODO: add all routes
  }

  insertRoutes(index: number, routes: RouteTree[]): void {
    this._routes.insertAt(index, routes);
  }

  removeRoutes(routes: RouteTree[]): void {
    this._routes.remove((route) => routes.includes(route));
  }

  route(id: string): RouteTree | undefined {
    return this._routesById$.value[id];
  }

  route$(id: string): Observable<RouteTree | undefined> {
    return this._routesById$.pipe(
      map((map) => map[id]),
      distinctUntilChanged()
    );
  }
}
