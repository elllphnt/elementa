import { Observable } from "rxjs";
import { Project } from "../../../infrastructure/_.js";
import { RouteTree } from "./route_tree.js"; // make sure Route is updated too
import { AppVariable } from "./variable.js"; // make sure Variable is updated too

export interface App {
  project: Project;

  routes: RouteTree[];
  routes$: Observable<RouteTree[]>;

  variables: AppVariable[];
  variables$: Observable<AppVariable[]>;

  route(id: string): RouteTree | undefined;
  route$(id: string): Observable<RouteTree | undefined>;

  variable(varName: string): AppVariable | undefined;
  variable$(varName: string): Observable<AppVariable | undefined>;

  getEditor<E>(editorKey: string): E;
}
