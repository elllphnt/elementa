import { Observable } from "rxjs";
import { FileModelAdaptor } from "~/project/_.js";
import { Identifiable } from "../_shared/identifiable.js";
import { Router } from "./app.js";

export interface RouteTree<R extends RouteTree = RouteTree<any>>
  extends Identifiable {
  app: Router;

  children: R[];
  children$: Observable<R[]>;

  path: string | undefined;
  path$: Observable<string | undefined>;

  mainViewUrl: string | undefined;
  mainViewUrl$: Observable<string | undefined>;

  errorViewUrl: string | undefined;
  errorViewUrl$: Observable<string | undefined>;

  pendingViewUrl: string | undefined;
  pendingViewUrl$: Observable<string | undefined>;

  notFoundViewUrl: string | undefined;
  notFoundViewUrl$: Observable<string | undefined>;

  loaderUrl: string | undefined;
  loaderUrl$: Observable<string | undefined>;

  handlerUrl: string | undefined;
  handlerUrl$: Observable<string | undefined>;

  mainViewComponent: FileModelAdaptor<"component"> | undefined;
  mainViewComponent$: Observable<FileModelAdaptor<"component"> | undefined>;

  errorViewComponent: FileModelAdaptor<"component"> | undefined;
  errorViewComponent$: Observable<FileModelAdaptor<"component"> | undefined>;

  pendingViewComponent: FileModelAdaptor<"component"> | undefined;
  pendingViewComponent$: Observable<FileModelAdaptor<"component"> | undefined>;

  notFoundViewComponent: FileModelAdaptor<"component"> | undefined;
  notFoundViewComponent$: Observable<FileModelAdaptor<"component"> | undefined>;

  // setters

  setPath(path: string | undefined): void;
  setMainViewUrl(url: string | undefined): void;
  setErrorViewUrl(url: string | undefined): void;
  setPendingViewUrl(url: string | undefined): void;
  setNotFoundViewUrl(url: string | undefined): void;
  setLoaderUrl(url: string | undefined): void;
  setHandlerUrl(url: string | undefined): void;
  setParentId(id: string | undefined): void;

  addRoutes(routes: R[]): void;
  insertRoutes(index: number, routes: R[]): void;
  removeRoutes(routes: R[]): void;

  clone(): RouteTree<R>;
}
