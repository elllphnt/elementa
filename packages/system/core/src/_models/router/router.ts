import { RouteTreeData } from "@elllphnt/elementa-base";
import { Observable, of } from "rxjs";
import { File } from "~/project/_.js";
import { Blueprint } from "../blueprint/bleuprint.js";
import { ElementaEnvironment, ElementaPreview } from "../elementa/_.js";
import { RouteTree } from "./route_tree.js"; // make sure Route is updated too

export class RouterElementaEnvironment implements ElementaEnvironment {
  router: Router;
  get project() {
    return this.router.file.project;
  }

  get hostUrl(): string | undefined {
    return this.router.file.url;
  }

  fragment() {
    return undefined;
  }
  fragment$() {
    return of(undefined);
  }

  constructor({ router }: { router: Router }) {
    this.router = router;
  }
  get defaultRouterUrl(): string | undefined {
    throw new Error("Method not implemented.");
  }
}

export interface Router<R extends RouteTree = RouteTree> {
  file: File;
  blueprint: Blueprint;
  preview: ElementaPreview;

  routes: R[];
  routes$: Observable<R[]>;

  createRoute(init: Omit<RouteTreeData, "id" | "children">): R;

  addRoutes(routes: R[]): void;
  insertRoutes(index: number, routes: R[]): void;
  removeRoutes(routes: R[]): void;

  clone(): Router;
}
