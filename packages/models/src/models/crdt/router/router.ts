import { getOrCreateYArray, getOrCreateYMap } from "@elllphnt/crdt";
import { RouteTreeData } from "@elllphnt/elementa-base";
import { File, genId, Router } from "@elllphnt/elementa-core";
import { AggregatedCrdtModelList, CrdtModel } from "@elllphnt/elementa-utils";
import { BehaviorSubject, distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { CrdtBlueprint } from "../blueprint/_.js";
import { CrdtRouteTree } from "./route_tree.js";

export class CrdtRouter
  extends CrdtModel<y.Map<any>>
  implements Router<CrdtRouteTree>
{
  readonly file: File;
  readonly blueprint: CrdtBlueprint;

  private readonly _routes: AggregatedCrdtModelList<CrdtRouteTree>;
  private readonly _routesById$ = new BehaviorSubject<
    Record<string, CrdtRouteTree>
  >({});

  constructor({
    crdt,
    file,
    initialized,
  }: {
    crdt: y.Map<any>;
    file: File;
    initialized?: boolean;
  }) {
    super({ crdt });
    this.file = file;

    const editors = getOrCreateYMap(crdt, "editors");
    const blueprintMap = getOrCreateYMap(editors, "blueprint");
    this.blueprint = new CrdtBlueprint(blueprintMap, { initialized });

    this._routes = new AggregatedCrdtModelList({
      crdt: getOrCreateYArray<y.Map<any>>(crdt, "routes"),
      create: (entry, init) =>
        new CrdtRouteTree(entry, {
          app: this,
          initialized: init && initialized,
        }),
    });

    // reactive index
    const sub = this._routes.models$.subscribe((routes) => {
      const byId: Record<string, CrdtRouteTree> = {};
      const recurse = (list: CrdtRouteTree[]) => {
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

  get routes(): CrdtRouteTree[] {
    return this._routes.models;
  }

  get routes$(): Observable<CrdtRouteTree[]> {
    return this._routes.models$;
  }

  createRoute(init: Omit<RouteTreeData, "id" | "children">): CrdtRouteTree {
    const map = new y.Map();
    map.set("id", genId());
    if (init.path != undefined) {
      map.set("path", init.path);
    }
    if (init.mainViewUrl != undefined) {
      map.set("mainViewUrl", init.mainViewUrl);
    }
    if (init.errorViewUrl != undefined) {
      map.set("errorViewUrl", init.errorViewUrl);
    }
    if (init.pendingViewUrl != undefined) {
      map.set("pendingViewUrl", init.pendingViewUrl);
    }
    if (init.notFoundViewUrl != undefined) {
      map.set("notFoundViewUrl", init.notFoundViewUrl);
    }
    if (init.loaderUrl != undefined) {
      map.set("loaderUrl", init.loaderUrl);
    }
    if (init.handlerUrl != undefined) {
      map.set("handlerUrl", init.handlerUrl);
    }

    return new CrdtRouteTree(map, { app: this });
  }

  addRoutes(routes: CrdtRouteTree[]): void {
    this._routes.add(routes);
  }

  insertRoutes(index: number, routes: CrdtRouteTree[]): void {
    this._routes.insert(index, routes);
  }

  removeRoutes(routes: CrdtRouteTree[]): void {
    this._routes.remove(routes);
  }

  route(id: string): CrdtRouteTree | undefined {
    return this._routesById$.value[id];
  }

  route$(id: string): Observable<CrdtRouteTree | undefined> {
    return this._routesById$.pipe(
      map((map) => map[id]),
      distinctUntilChanged()
    );
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtRouter({ crdt, file: this.file, initialized: true }) as this;
  }
}
