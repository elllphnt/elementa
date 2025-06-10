import { RouteTreeData, RouterData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  Model,
  RecordState,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable, combineLatest, map } from "rxjs";
import { genId } from "~/_lib/id.js";
import { File } from "~/project/_.js";
import { Router } from "../../../_interfaces/router/app.js";
import { AppBlueprintModel } from "./blueprint/blueprint.js";
import { RouteTreeModel } from "./route_tree.js";

export class RouterModel
  extends Model<RouterData>
  implements Router<RouteTreeModel>
{
  readonly file: File;
  readonly blueprint: AppBlueprintModel;

  private _state: RecordState<Omit<RouterData, "routes" | "variables">>;
  private _routes: AggregatedModelList<RouteTreeModel>;

  get routes(): RouteTreeModel[] {
    return this._routes.state.items;
  }
  get routes$(): Observable<RouteTreeModel[]> {
    return this._routes.state.items$;
  }

  editorData(key: string) {
    return this._state.entry("editors")?.[key];
  }
  editorData$(key: string): Observable<any> {
    return this._state.entry$("editors").pipe(map((editors) => editors?.[key]));
  }

  get data(): RouterData {
    return {
      ...this._state.record,
      routes: this._routes.data,
      editors: {
        blueprint: this.blueprint.data,
      },
    };
  }

  get data$(): Observable<RouterData> {
    return combineLatestMerged([
      this._state.record$,
      combineLatest({
        routes: this._routes.data$,
        editors: combineLatest({
          blueprint: this.blueprint.data$,
        }),
      }),
    ]);
  }

  constructor({ init, file }: { init: RouterData; file: File }) {
    super();

    this.file = file;
    this.blueprint = new AppBlueprintModel({
      init: init.editors?.blueprint ?? {},
    });

    const { routes, ...stateData } = init;

    this._state = new RecordState({
      init: stateData,
    });

    this._routes = new AggregatedModelList({
      init: routes || [],
      create: (data) => new RouteTreeModel({ init: data, app: this }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._routes.dispose();
    });
  }

  createRoute(init: Omit<RouteTreeData, "id" | "children">): RouteTreeModel {
    const route = new RouteTreeModel({
      init: {
        ...init,
        id: genId(),
      },
      app: this,
    });
    return route;
  }

  addRoutes(routes: RouteTreeModel[]): void {
    this._routes.state.append(routes);
  }
  insertRoutes(index: number, routes: RouteTreeModel[]): void {
    this._routes.state.insertAt(index, routes);
  }
  removeRoutes(routes: RouteTreeModel[]): void {
    const set = new Set(routes);
    this._routes.state.remove((r) => set.has(r));
  }

  restore(data: RouterData) {
    const { routes, editors, ...stateData } = data;

    this.blueprint.restore(editors?.blueprint || {});
    this._state.setRecord(stateData);
    this._routes.restore(routes || []);
  }
}
