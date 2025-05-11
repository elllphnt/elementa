import { AppData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  createEnhancedReactiveList,
  getOrCreateYArray,
  getOrCreateYMap,
  ReactiveList,
  ReactiveMap,
  setEnhancer,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { Project } from "../infrastructure/project/_.js";
import { attachRouteTreeList } from "./route_tree/_list.js";
import { attachRouteTree, RouteTree } from "./route_tree/route_tree.js"; // make sure Route is updated too
import { AppVariable, attachAppVariable } from "./variable.js"; // make sure Variable is updated too

export type App = ReactiveMap<AppData> & {
  project: Project;
  routes: ReactiveList<RouteTree>;
  variables: ReactiveList<AppVariable>;
  editors: ReactiveMap<y.AbstractType<any>>;

  route(id: string): RouteTree | undefined;
  route$(id: string): Observable<RouteTree | undefined>;

  variable(varName: string): AppVariable | undefined;
  variable$(varName: string): Observable<AppVariable | undefined>;

  getMapEditorState(editorKey: string): y.Map<any>;
  getArrayEditorState(editorKey: string): y.Array<any>;
};

export function attachApp(ymap: y.Map<any>, project: Project): ymap is App {
  if (!attachReactiveMap<AppData>(ymap)) {
    throw new Error("Failed to attach reactive map to ymap");
  }
  const rxMap = ymap;
  const app = rxMap as App;

  // initialization
  app.project = project;

  const routes = getOrCreateYArray<y.Map<any>>(rxMap, "routes");
  if (!attachRouteTreeList(routes, app)) {
    throw new Error("Failed to attach route tree list");
  }
  app.routes = routes;

  const editors = getOrCreateYMap(rxMap, "editors");
  if (!attachReactiveMap(editors)) {
    throw new Error("Failed to attach reactive map to editors");
  }
  app.editors = editors as ReactiveMap<y.AbstractType<any>>;

  app.routes = createEnhancedReactiveList(
    getOrCreateYArray<y.Map<any>>(rxMap, "routes"),
    attachRouteTree,
    (yMap) => attachRouteTree(yMap, app)
  );
  app.variables = createEnhancedReactiveList(
    getOrCreateYArray<y.Map<any>>(rxMap, "variables"),
    attachAppVariable,
    (yMap) => attachAppVariable(yMap, app)
  );

  const _variablesByVarName$ = new BehaviorSubject<Record<string, AppVariable>>(
    {}
  );
  app.variable = (varName: string) => _variablesByVarName$.value[varName];
  app.variable$ = (varName: string) =>
    _variablesByVarName$.pipe(
      map((variables) => variables[varName]),
      distinctUntilChanged()
    );

  app.getMapEditorState = (editorKey) => {
    return getOrCreateYMap(app.editors, editorKey);
  };
  app.getArrayEditorState = (editorKey) => {
    return getOrCreateYArray(app.editors, editorKey);
  };

  // subscriptions
  const variablesSubscription = app.variables.observable$.subscribe(
    (variables) => {
      _variablesByVarName$.next(
        Object.fromEntries(
          variables.map((variable) => [variable.varName, variable])
        )
      );
    }
  );

  // disposal
  const disposeBase = rxMap.dispose.bind(rxMap);
  rxMap.dispose = () => {
    variablesSubscription.unsubscribe();
    _variablesByVarName$.complete();

    app.routes.dispose();
    app.variables.dispose();
    app.editors.dispose();

    disposeBase();
  };

  setEnhancer(app, attachApp);
  return true;
}

export function createApp(project: Project): App {
  const ymap = new y.Map<any>();
  if (!attachApp(ymap, project)) {
    throw new Error("Failed to attach app");
  }
  return ymap;
}
