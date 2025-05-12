import { AppBlueprintData, AppData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  Model,
  RecordState,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable, forkJoin, map } from "rxjs";
import { Project } from "../../../infrastructure/_.js";
import { RouteTree } from "../../_interfaces/_.js";
import { App } from "../../_interfaces/app/app.js";
import { AppBlueprintModel } from "./editors/_.js";
import { RouteTreeModel } from "./route_tree.js";
import { AppVariableModel } from "./variable.js";

export class AppModel extends Model<AppData> implements App {
  readonly project: Project;
  readonly blueprint: AppBlueprintModel;

  private _state: RecordState<
    Omit<AppData, "routes" | "variables" | "editors">
  >;
  private _routes: AggregatedModelList<RouteTreeModel>;
  private _variables: AggregatedModelList<AppVariableModel>;

  get routes(): RouteTreeModel[] {
    return this._routes.state.items;
  }

  get routes$(): Observable<RouteTreeModel[]> {
    return this._routes.state.items$;
  }

  get variables(): AppVariableModel[] {
    return this._variables.state.items;
  }

  get variables$(): Observable<AppVariableModel[]> {
    return this._variables.state.items$;
  }

  route(id: string): RouteTree | undefined {
    return this._routes.state.items.find((route) => route.id === id);
  }

  route$(id: string): Observable<RouteTree | undefined> {
    return this._routes.state.items$.pipe(
      map((routes) => routes.find((route) => route.id === id))
    );
  }

  variable(varName: string): AppVariableModel | undefined {
    return this._variables.state.items.find(
      (variable) => variable.varName === varName
    );
  }

  variable$(varName: string): Observable<AppVariableModel | undefined> {
    return this._variables.state.items$.pipe(
      map((variables) =>
        variables.find((variable) => variable.varName === varName)
      )
    );
  }

  get data(): AppData {
    return {
      ...this._state.record,
      routes: this._routes.data,
      variables: this._variables.data,
    };
  }

  get data$(): Observable<AppData> {
    return combineLatestMerged([
      this._state.record$,
      forkJoin({
        routes: this._routes.data$,
        variables: this._variables.data$,
      }),
    ]);
  }

  constructor({ init, project }: { init: AppData; project: Project }) {
    super();

    this.project = project;
    
    const { routes, variables, editors, ...stateData } = init;

    this.blueprint = new AppBlueprintModel({
      init: (editors?.blueprint as AppBlueprintData) || {
        nodes: [],
      },
    });

    this._state = new RecordState({
      init: stateData,
    });

    this._routes = new AggregatedModelList({
      init: routes || [],
      create: (data) => new RouteTreeModel({ init: data, app: this }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this._variables = new AggregatedModelList({
      init: variables || [],
      create: (data) => new AppVariableModel({ init: data, app: this }),
      dataRef: () => 1, // DataInput are interchangeable
      modelRef: () => 1,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._routes.dispose();
      this._variables.dispose();
    });
  }

  restore(data: AppData) {
    const { routes, variables, editors, ...stateData } = data;

    this._state.setRecord(stateData);
    this._routes.restore(routes || []);
    this._variables.restore(variables || []);

    if (editors?.blueprint) {
      this.blueprint.restore(editors.blueprint as AppBlueprintData);
    }
  }
}
