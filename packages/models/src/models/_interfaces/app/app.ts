import { ReactiveList, ReactiveMap } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { Project } from "../../../infrastructure/_.js";
import { RouteTree } from "./route_tree/route_tree.js"; // make sure Route is updated too
import { AppVariable } from "./variable.js"; // make sure Variable is updated too

export interface App {
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
}
