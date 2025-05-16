import { RouteTreeData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { File } from "../../../infrastructure/_.js";
import { AppBlueprint } from "./editors/_.js";
import { RouteTree } from "./route_tree.js"; // make sure Route is updated too

export interface App {
  file: File;
  blueprint: AppBlueprint;

  routes: RouteTree[];
  routes$: Observable<RouteTree[]>;

  route(id: string): RouteTree | undefined;

  addRoute(route: RouteTreeData): void;
  removeRoutes(predicate: (item: RouteTree) => boolean): RouteTree[];
  removeRoutesAt(index: number, count?: number): RouteTree[];
}
