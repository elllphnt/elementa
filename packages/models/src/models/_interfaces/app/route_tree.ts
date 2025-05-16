import { RouteTreeData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Identifiable } from "../_shared/identifiable.js";
import { FileModelAdaptor } from "../adaptors/_.js";
import { Component } from "../component/_.js";
import { App } from "./app.js";

export interface RouteTree extends Identifiable {
  app: App;
  parent?: RouteTree;

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

  mainViewComponent: FileModelAdaptor<Component> | undefined;
  mainViewComponent$: Observable<FileModelAdaptor<Component> | undefined>;

  errorViewComponent: FileModelAdaptor<Component> | undefined;
  errorViewComponent$: Observable<FileModelAdaptor<Component> | undefined>;

  pendingViewComponent: FileModelAdaptor<Component> | undefined;
  pendingViewComponent$: Observable<FileModelAdaptor<Component> | undefined>;

  notFoundViewComponent: FileModelAdaptor<Component> | undefined;
  notFoundViewComponent$: Observable<FileModelAdaptor<Component> | undefined>;

  // setters

  setPath(path: string | undefined): void;
  setMainViewUrl(url: string | undefined): void;
  setErrorViewUrl(url: string | undefined): void;
  setPendingViewUrl(url: string | undefined): void;
  setNotFoundViewUrl(url: string | undefined): void;
  setLoaderUrl(url: string | undefined): void;
  setHandlerUrl(url: string | undefined): void;
  setParentId(id: string | undefined): void;

  addRoute(route: RouteTreeData): void;
  removeRoutes(predicate: (item: RouteTree) => boolean): RouteTree[];
  removeRoutesAt(index: number, count?: number): RouteTree[];
}
