import { RouteTreeData, RouterData } from "@elllphnt/elementa-base";
import { File, Router, genId } from "@elllphnt/elementa-core";
import {
  AggregatedModelList,
  Model,
  RecordState,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable, combineLatest, map } from "rxjs";
import { StatefulAppBlueprint } from "./blueprint/blueprint.js";
import { StatefulRouteTree } from "./route_tree.js";

export class StatefulRouter
  extends Model<RouterData>
  implements Router<StatefulRouteTree>
{
  readonly file: File;
  readonly blueprint: StatefulAppBlueprint;

  private _state: RecordState<Omit<RouterData, "routes" | "variables">>;
  private _routes: AggregatedModelList<StatefulRouteTree>;

  get routes(): StatefulRouteTree[] {
    return this._routes.state.items;
  }
  get routes$(): Observable<StatefulRouteTree[]> {
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
    this.blueprint = new StatefulAppBlueprint({
      init: init.editors?.blueprint ?? {},
    });

    const { routes, ...stateData } = init;

    this._state = new RecordState({
      init: stateData,
    });

    this._routes = new AggregatedModelList({
      init: routes || [],
      create: (data) => new StatefulRouteTree({ init: data, app: this }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._routes.dispose();
    });
  }

  createRoute(init: Omit<RouteTreeData, "id" | "children">): StatefulRouteTree {
    const route = new StatefulRouteTree({
      init: {
        ...init,
        id: genId(),
      },
      app: this,
    });
    return route;
  }

  addRoutes(routes: StatefulRouteTree[]): void {
    this._routes.state.append(routes);
  }
  insertRoutes(index: number, routes: StatefulRouteTree[]): void {
    this._routes.state.insertAt(index, routes);
  }
  removeRoutes(routes: StatefulRouteTree[]): void {
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
