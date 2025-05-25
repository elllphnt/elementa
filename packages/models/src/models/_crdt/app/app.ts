import { RouteTreeData } from "@elllphnt/elementa-base";
import {
  AggregatedCrdtModelList,
  CrdtModel,
  getOrCreateYArray,
  getOrCreateYMap,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { genId } from "~/_lib/id.js";
import { File } from "../../../infrastructure/_.js";
import { App } from "../../_interfaces/app/app.js";
import { CrdtAppBlueprint } from "./blueprint/_.js";
import { CrdtRouteTree } from "./route_tree.js";

export class CrdtAppModel
  extends CrdtModel<y.Map<any>>
  implements App<CrdtRouteTree>
{
  readonly file: File;
  readonly blueprint: CrdtAppBlueprint;

  private readonly _routes: AggregatedCrdtModelList<CrdtRouteTree>;
  private readonly _routesById$ = new BehaviorSubject<
    Record<string, CrdtRouteTree>
  >({});

  constructor(crdt: y.Map<any>, file: File) {
    super({ crdt });
    this.file = file;

    const editors = getOrCreateYMap(crdt, "editors");
    const blueprintMap = getOrCreateYMap(editors, "blueprint");
    this.blueprint = new CrdtAppBlueprint(blueprintMap);

    this._routes = new AggregatedCrdtModelList({
      crdt: getOrCreateYArray<y.Map<any>>(crdt, "routes"),
      create: (entry) => new CrdtRouteTree({ crdt: entry, app: this }),
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
    map.set("path", init.path ?? "");
    map.set("mainViewUrl", init.mainViewUrl ?? "");
    map.set("errorViewUrl", init.errorViewUrl ?? "");
    map.set("pendingViewUrl", init.pendingViewUrl ?? "");
    map.set("notFoundViewUrl", init.notFoundViewUrl ?? "");
    map.set("loaderUrl", init.loaderUrl ?? "");
    map.set("handlerUrl", init.handlerUrl ?? "");
    map.set("children", new y.Array());

    return new CrdtRouteTree({ crdt: map, app: this });
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
}
