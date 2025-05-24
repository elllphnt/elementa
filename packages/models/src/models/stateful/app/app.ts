import { AppData, RouteTreeData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  Model,
  RecordState,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable, combineLatest, map } from "rxjs";
import { File } from "../../../infrastructure/_.js";
import { App } from "../../_interfaces/app/app.js";
import { RouteTreeModel } from "./route_tree.js";

export class AppModel extends Model<AppData> implements App {
  readonly file: File;

  private _state: RecordState<Omit<AppData, "routes" | "variables">>;
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

  get data(): AppData {
    return {
      ...this._state.record,
      routes: this._routes.data,
    };
  }

  get data$(): Observable<AppData> {
    return combineLatestMerged([
      this._state.record$,
      combineLatest({
        routes: this._routes.data$,
      }),
    ]);
  }

  constructor({ init, file }: { init: AppData; file: File }) {
    super();

    this.file = file;

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

  addRoute(route: RouteTreeData): void {
    this._routes.add(route);
  }
  removeRoutes(predicate: (item: RouteTreeModel) => boolean) {
    return this._routes.state.remove(predicate);
  }
  removeRoutesAt(index: number, count?: number) {
    return this._routes.state.removeAt(index, count);
  }
  setEditorData(key: string, data: any) {
    this._state.set("editors", {
      ...this._state.entry("editors"),
      [key]: data,
    });
  }

  restore(data: AppData) {
    const { routes, ...stateData } = data;

    this._state.setRecord(stateData);
    this._routes.restore(routes || []);
  }
}
