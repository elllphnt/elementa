import { Observable } from "rxjs";
import { Project } from "../../../infrastructure/_.js";
import { AppBlueprint } from "./editors/_.js";
import { RouteTree } from "./route_tree.js"; // make sure Route is updated too

export interface App {
  project: Project;
  blueprint: AppBlueprint;

  routes: RouteTree[];
  routes$: Observable<RouteTree[]>;

  route(id: string): RouteTree | undefined;
  route$(id: string): Observable<RouteTree | undefined>;
}
