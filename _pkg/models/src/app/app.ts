import { AppData } from "@elllphnt/elementa-base";
import {
  combineLatestOrEmpty,
  CRDTModelList,
  MapCRDTModel,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, distinctUntilChanged, map, switchMap } from "rxjs";
import * as y from "yjs";
import { Project } from "../project/_";
import { Route } from "./route";
import { AppVariable } from "./variable";

export class App extends MapCRDTModel<AppData> {
  readonly project: Project;

  readonly routes: CRDTModelList<Route>;
  readonly variables: CRDTModelList<AppVariable>;

  private readonly _routesById$ = new BehaviorSubject<Record<string, Route>>(
    {}
  );
  private readonly _variablesByIdentifier$ = new BehaviorSubject<
    Record<string, AppVariable>
  >({});

  route(id: string) {
    return this._routesById$.value[id];
  }
  route$(id: string) {
    return this._routesById$.pipe(
      map((routes) => routes[id]),
      distinctUntilChanged()
    );
  }

  variable(identifier: string) {
    return this._variablesByIdentifier$.value[identifier];
  }
  variable$(identifier: string) {
    return this._variablesByIdentifier$.pipe(
      map((variables) => variables[identifier]),
      distinctUntilChanged()
    );
  }

  constructor({ project, ymap }: { ymap: y.Map<any>; project: Project }) {
    super(ymap);

    this.project = project;

    this.routes = new CRDTModelList<Route>(
      this.getOrCreateArray("routes"),
      (ymap) => {
        return new Route({
          ymap,
          app: this,
        });
      }
    );
    const routesByIdSubscription = this.routes.items$.subscribe((routes) => {
      this._routesById$.next(
        Object.fromEntries(routes.map((route) => [route.id, route]))
      );
    });

    this.variables = new CRDTModelList<AppVariable>(
      this.getOrCreateArray("variables"),
      (ymap) => {
        return new AppVariable({
          ymap,
          app: this,
        });
      }
    );
    const variablesByIdentifierSubscription = this.variables.items$
      .pipe(
        switchMap((variables) =>
          combineLatestOrEmpty(
            variables.map((variable) =>
              variable.identifier$.pipe(
                map((identifier) => [identifier, variable] as const)
              )
            )
          )
        )
      )
      .subscribe((variables) => {
        this._variablesByIdentifier$.next(Object.fromEntries(variables));
      });

    this.addDisposer(() => {
      this.routes.dispose();
      this._routesById$.complete();
      this.variables.dispose();
      this._variablesByIdentifier$.complete();
      routesByIdSubscription.unsubscribe();
      variablesByIdentifierSubscription.unsubscribe();
    });
  }
}
