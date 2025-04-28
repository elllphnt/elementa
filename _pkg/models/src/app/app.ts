import { AppData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  createEnhancedReactiveList,
  getOrCreateYArray,
  getOrCreateYMap,
  ReactiveList,
  ReactiveMap,
} from "@elllphnt/elementa-utils";
import { setEnhancer } from "@elllphnt/elementa-utils/dist/core/enhancer";
import { BehaviorSubject, distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { Project } from "../project/_";
import { attachRoute, Route } from "./route"; // make sure Route is updated too
import { AppVariable, attachAppVariable } from "./variable"; // make sure Variable is updated too

export type App = ReactiveMap<AppData> & {
  project: Project;
  routes: ReactiveList<Route>;
  variables: ReactiveList<AppVariable>;
  editors: ReactiveMap<y.AbstractType<any>>;

  route(id: string): Route | undefined;
  route$(id: string): Observable<Route | undefined>;

  variable(varName: string): AppVariable | undefined;
  variable$(varName: string): Observable<AppVariable | undefined>;
};

export function attachApp(ymap: y.Map<any>, project: Project): App {
  const rxMap = attachReactiveMap<AppData>(ymap);
  const app = rxMap as App;

  // initialization
  app.project = project;
  app.routes = createEnhancedReactiveList(
    getOrCreateYArray<y.Map<any>>(rxMap, "routes"),
    attachRoute,
    (yMap) => attachRoute(yMap, app)
  );
  app.variables = createEnhancedReactiveList(
    getOrCreateYArray<y.Map<any>>(rxMap, "variables"),
    attachAppVariable,
    (yMap) => attachAppVariable(yMap, app)
  );
  app.editors = attachReactiveMap(getOrCreateYMap(rxMap, "editors"));

  const _routesById$ = new BehaviorSubject<Record<string, Route>>({});
  app.route = (id: string) => _routesById$.value[id];
  app.route$ = (id: string) =>
    _routesById$.pipe(
      map((routes) => routes[id]),
      distinctUntilChanged()
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

  // subscriptions

  const routesSubscription = app.routes.observable$.subscribe((routes) => {
    _routesById$.next(
      Object.fromEntries(routes.map((route) => [route.id, route]))
    );
  });
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
    routesSubscription.unsubscribe();
    _routesById$.complete();

    variablesSubscription.unsubscribe();
    _variablesByVarName$.complete();

    app.routes.dispose();
    app.variables.dispose();
    app.editors.dispose();

    disposeBase();
  };

  setEnhancer(app, attachApp);
  return app;
}

export function createApp(project: Project): App {
  const ymap = new y.Map<any>();
  return attachApp(ymap, project);
}
