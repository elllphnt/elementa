import { RouteTreeData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { File } from "../../../infrastructure/_.js";
import { RouteTree } from "./route_tree.js"; // make sure Route is updated too

export interface App {
  file: File;

  routes: RouteTree[];
  routes$: Observable<RouteTree[]>;

  editorData(key: string): any;
  editorData$(key: string): Observable<any>;
  setEditorData(key: string, data: any): void;

  addRoute(route: RouteTreeData): void;
  removeRoutes(predicate: (item: RouteTree) => boolean): RouteTree[];
  removeRoutesAt(index: number, count?: number): RouteTree[];
}
