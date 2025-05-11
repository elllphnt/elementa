import { Observable } from "rxjs";
import { Component } from "../component/_.js";
import { FileModel } from "../file/_.js";
import { App } from "./app.js";

export interface RouteTree {
  app: App;
  id: string;

  children: RouteTree[];
  children$: Observable<RouteTree[]>;

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

  mainViewComponent: FileModel<Component> | undefined;
  mainViewComponent$: Observable<FileModel<Component> | undefined>;

  errorViewComponent: FileModel<Component> | undefined;
  errorViewComponent$: Observable<FileModel<Component> | undefined>;

  pendingViewComponent: FileModel<Component> | undefined;
  pendingViewComponent$: Observable<FileModel<Component> | undefined>;

  notFoundViewComponent: FileModel<Component> | undefined;
  notFoundViewComponent$: Observable<FileModel<Component> | undefined>;

  // setters

  setPath(path: string | undefined): void;
  setMainViewUrl(url: string | undefined): void;
  setErrorViewUrl(url: string | undefined): void;
  setPendingViewUrl(url: string | undefined): void;
  setNotFoundViewUrl(url: string | undefined): void;
  setLoaderUrl(url: string | undefined): void;
  setHandlerUrl(url: string | undefined): void;
  setParentId(id: string | undefined): void;
}
