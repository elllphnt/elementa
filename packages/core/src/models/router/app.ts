import { RouteTreeData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { File } from "~/project/_.js";
import { AppBlueprint } from "../blueprint/bleuprint.js";
import { RouteTree } from "./route_tree.js"; // make sure Route is updated too

export interface Router<R extends RouteTree = RouteTree> {
  file: File;
  blueprint: AppBlueprint;

  routes: R[];
  routes$: Observable<R[]>;

  createRoute(init: Omit<RouteTreeData, "id" | "children">): R;

  addRoutes(routes: R[]): void;
  insertRoutes(index: number, routes: R[]): void;
  removeRoutes(routes: R[]): void;

  clone(): Router;
}
