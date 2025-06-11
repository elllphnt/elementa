import { getOrCreateYArray } from "@elllphnt/crdt";
import { RouteTreeData } from "@elllphnt/elementa-base";
import { Router, RouteTree } from "@elllphnt/elementa-core";
import {
  AggregatedCrdtModelList,
  CrdtRecordState,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { CrdtIdentifiable } from "../_shared/identifiable.js";

export class CrdtRouteTree
  extends CrdtIdentifiable
  implements RouteTree<CrdtRouteTree>
{
  readonly app: Router;

  private _state: CrdtRecordState<Omit<RouteTreeData, "children" | "id">>;
  private _children: AggregatedCrdtModelList<CrdtRouteTree>;

  constructor(
    crdt: y.Map<any>,
    { app, initialized }: { app: Router; initialized?: boolean }
  ) {
    super({ crdt, initialized });
    this.app = app;

    this._state = new CrdtRecordState<Omit<RouteTreeData, "children" | "id">>(
      crdt
    );

    this._children = new AggregatedCrdtModelList<CrdtRouteTree>({
      crdt: getOrCreateYArray<y.Map<any>>(crdt, "children"),
      create: (crdt, init) =>
        new CrdtRouteTree(crdt, { app, initialized: init && initialized }),
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._children.dispose();
    });
  }

  get children(): CrdtRouteTree[] {
    return this._children.models;
  }

  get children$(): Observable<CrdtRouteTree[]> {
    return this._children.models$;
  }

  get path() {
    return this._state.entry("path");
  }
  get path$() {
    return this._state.entry$("path");
  }

  get mainViewUrl() {
    return this._state.entry("mainViewUrl");
  }
  get mainViewUrl$() {
    return this._state.entry$("mainViewUrl");
  }

  get errorViewUrl() {
    return this._state.entry("errorViewUrl");
  }
  get errorViewUrl$() {
    return this._state.entry$("errorViewUrl");
  }

  get pendingViewUrl() {
    return this._state.entry("pendingViewUrl");
  }
  get pendingViewUrl$() {
    return this._state.entry$("pendingViewUrl");
  }

  get notFoundViewUrl() {
    return this._state.entry("notFoundViewUrl");
  }
  get notFoundViewUrl$() {
    return this._state.entry$("notFoundViewUrl");
  }

  get loaderUrl() {
    return this._state.entry("loaderUrl");
  }
  get loaderUrl$() {
    return this._state.entry$("loaderUrl");
  }

  get handlerUrl() {
    return this._state.entry("handlerUrl");
  }
  get handlerUrl$() {
    return this._state.entry$("handlerUrl");
  }

  get mainViewComponent() {
    const url = this.mainViewUrl;
    return url
      ? this.app.file.project.infrastructure.component(url)
      : undefined;
  }

  get mainViewComponent$() {
    return this.mainViewUrl$.pipe(
      map((url) =>
        url ? this.app.file.project.infrastructure.component(url) : undefined
      )
    );
  }

  get errorViewComponent() {
    const url = this.errorViewUrl;
    return url
      ? this.app.file.project.infrastructure.component(url)
      : undefined;
  }

  get errorViewComponent$() {
    return this.errorViewUrl$.pipe(
      map((url) =>
        url ? this.app.file.project.infrastructure.component(url) : undefined
      )
    );
  }

  get pendingViewComponent() {
    const url = this.pendingViewUrl;
    return url
      ? this.app.file.project.infrastructure.component(url)
      : undefined;
  }

  get pendingViewComponent$() {
    return this.pendingViewUrl$.pipe(
      map((url) =>
        url ? this.app.file.project.infrastructure.component(url) : undefined
      )
    );
  }

  get notFoundViewComponent() {
    const url = this.notFoundViewUrl;
    return url
      ? this.app.file.project.infrastructure.component(url)
      : undefined;
  }

  get notFoundViewComponent$() {
    return this.notFoundViewUrl$.pipe(
      map((url) =>
        url ? this.app.file.project.infrastructure.component(url) : undefined
      )
    );
  }

  setPath(value: string | undefined): void {
    this._state.set("path", value);
  }

  setMainViewUrl(url: string | undefined): void {
    this._state.set("mainViewUrl", url);
  }

  setErrorViewUrl(url: string | undefined): void {
    this._state.set("errorViewUrl", url);
  }

  setPendingViewUrl(url: string | undefined): void {
    this._state.set("pendingViewUrl", url);
  }

  setNotFoundViewUrl(url: string | undefined): void {
    this._state.set("notFoundViewUrl", url);
  }

  setLoaderUrl(url: string | undefined): void {
    this._state.set("loaderUrl", url);
  }

  setHandlerUrl(url: string | undefined): void {
    this._state.set("handlerUrl", url);
  }

  setParentId(id: string | undefined): void {
    this._state.set("parentId", id);
  }

  addRoutes(routes: CrdtRouteTree[]): void {
    this._children.add(routes);
  }
  insertRoutes(index: number, routes: CrdtRouteTree[]): void {
    this._children.insert(index, routes);
  }
  removeRoutes(routes: CrdtRouteTree[]): void {
    this._children.remove(routes);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtRouteTree(crdt, {
      app: this.app,
      initialized: true,
    }) as this;
  }
}
