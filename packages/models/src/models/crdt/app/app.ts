import { AppData } from "@elllphnt/elementa-base";
import {
  assert,
  attachEnhancedReactiveList,
  attachReactiveMap,
  getOrCreateYArray,
  getOrCreateYMap,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import * as y from "yjs";
import { Project } from "../../../infrastructure/_.js";
import { App, AppVariable, RouteTree } from "../../_interfaces/_.js";
import { attachRouteTree } from "./route_tree.js";
import { attachAppVariable } from "./variable.js";

export function attachApp(
  app: y.Map<any>,
  project: Project
): app is y.Map<any> & App {
  assert(attachReactiveMap<AppData>(app));

  // Set project reference
  assert(setObjectProperty(app, "project", project));

  // Setup routes
  const routesList = getOrCreateYArray<y.Map<any>>(app, "routes");
  assert(
    attachEnhancedReactiveList<RouteTree>(
      routesList,
      attachRouteTree,
      (route) => attachRouteTree(route, app as unknown as App)
    )
  );
  assert(setObjectProperty(app, "routes$", routesList.items$));
  assert(setObjectGetter(app, "routes", () => routesList.items));

  // Setup variables
  const variablesList = getOrCreateYArray<y.Map<any>>(app, "variables");
  assert(
    attachEnhancedReactiveList<AppVariable>(
      variablesList,
      attachAppVariable,
      (varMap) => attachAppVariable(varMap, app as unknown as App)
    )
  );
  assert(setObjectProperty(app, "variables$", variablesList.items$));
  assert(setObjectGetter(app, "variables", () => variablesList.items));

  // Setup route lookup by ID
  const _routesById$ = new BehaviorSubject<Record<string, RouteTree>>({});
  routesList.items$.subscribe((routes) => {
    const routesById: Record<string, RouteTree> = {};

    function addRoute(route: RouteTree) {
      routesById[route.id] = route;
      route.children.forEach(addRoute);
    }

    routes.forEach(addRoute);
    _routesById$.next(routesById);
  });

  assert(
    setObjectProperty(app, "route$", (id: string) =>
      _routesById$.pipe(
        map((routes) => routes[id]),
        distinctUntilChanged()
      )
    )
  );
  assert(
    setObjectGetter(app, "route", () => (id: string) => _routesById$.value[id])
  );

  // Setup variable lookup by name
  const _variablesByName$ = new BehaviorSubject<Record<string, AppVariable>>(
    {}
  );
  variablesList.items$.subscribe((variables) => {
    _variablesByName$.next(
      Object.fromEntries(
        variables.map((variable) => [variable.varName, variable])
      )
    );
  });

  assert(
    setObjectProperty(app, "variable$", (varName: string) =>
      _variablesByName$.pipe(
        map((variables) => variables[varName]),
        distinctUntilChanged()
      )
    )
  );
  assert(
    setObjectGetter(
      app,
      "variable",
      () => (varName: string) => _variablesByName$.value[varName]
    )
  );

  // Setup editor getter
  const editors = getOrCreateYMap(app, "editors");
  assert(attachReactiveMap(editors));

  assert(
    setObjectGetter(app, "getEditor", () => <E>(editorKey: string): E => {
      const editorState = getOrCreateYMap(editors, editorKey);
      return editorState as unknown as E;
    })
  );

  // Setup cleanup
  const disposeBase = app.dispose || (() => {});
  app.dispose = () => {
    _routesById$.complete();
    _variablesByName$.complete();
    routesList.dispose?.();
    variablesList.dispose?.();
    editors.dispose?.();
    disposeBase();
  };

  return setEnhancer<App>(app, attachApp);
}
