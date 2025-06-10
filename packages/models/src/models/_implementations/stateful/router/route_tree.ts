import { RouteTreeData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  RecordState,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable, combineLatest, map } from "rxjs";
import { RouteTree } from "../../../_interfaces/router/route_tree.js";
import { StatefulIdentifiable } from "../_shared/identifiable.js";
import { StatefulRouter } from "./router.js";

export class StatefulRouteTree
  extends StatefulIdentifiable<RouteTreeData>
  implements RouteTree<StatefulRouteTree>
{
  readonly app: StatefulRouter;

  private _state: RecordState<Omit<RouteTreeData, "children" | "id">>;
  private _children: AggregatedModelList<StatefulRouteTree>;

  get children(): StatefulRouteTree[] {
    return this._children.state.items;
  }

  get children$(): Observable<StatefulRouteTree[]> {
    return this._children.state.items$;
  }

  get path(): string | undefined {
    return this._state.entry("path");
  }

  get path$(): Observable<string | undefined> {
    return this._state.entry$("path");
  }

  get mainViewUrl(): string | undefined {
    return this._state.entry("mainViewUrl");
  }

  get mainViewUrl$(): Observable<string | undefined> {
    return this._state.entry$("mainViewUrl");
  }

  get errorViewUrl(): string | undefined {
    return this._state.entry("errorViewUrl");
  }

  get errorViewUrl$(): Observable<string | undefined> {
    return this._state.entry$("errorViewUrl");
  }

  get pendingViewUrl(): string | undefined {
    return this._state.entry("pendingViewUrl");
  }

  get pendingViewUrl$(): Observable<string | undefined> {
    return this._state.entry$("pendingViewUrl");
  }

  get notFoundViewUrl(): string | undefined {
    return this._state.entry("notFoundViewUrl");
  }

  get notFoundViewUrl$(): Observable<string | undefined> {
    return this._state.entry$("notFoundViewUrl");
  }

  get loaderUrl(): string | undefined {
    return this._state.entry("loaderUrl");
  }

  get loaderUrl$(): Observable<string | undefined> {
    return this._state.entry$("loaderUrl");
  }

  get handlerUrl(): string | undefined {
    return this._state.entry("handlerUrl");
  }

  get handlerUrl$(): Observable<string | undefined> {
    return this._state.entry$("handlerUrl");
  }

  get mainViewComponent() {
    const mainViewUrl = this.mainViewUrl
      ? this.app.file.project.absoluteFileUrl(this.mainViewUrl)
      : undefined;
    return mainViewUrl
      ? this.app.file.project.infrastructure.component(mainViewUrl)
      : undefined;
  }

  get mainViewComponent$() {
    return this.mainViewUrl$.pipe(
      map((mainViewUrl) => {
        if (!mainViewUrl) {
          return undefined;
        }
        const mainViewComponent =
          this.app.file.project.infrastructure.component(
            this.app.file.project.absoluteFileUrl(mainViewUrl)
          );
        return mainViewComponent;
      })
    );
  }

  get errorViewComponent() {
    const errorViewUrl = this.errorViewUrl
      ? this.app.file.project.absoluteFileUrl(this.errorViewUrl)
      : undefined;
    return errorViewUrl
      ? this.app.file.project.infrastructure.component(errorViewUrl)
      : undefined;
  }

  get errorViewComponent$() {
    return this.errorViewUrl$.pipe(
      map((errorViewUrl) => {
        if (!errorViewUrl) {
          return undefined;
        }
        const errorViewComponent =
          this.app.file.project.infrastructure.component(
            this.app.file.project.absoluteFileUrl(errorViewUrl)
          );
        return errorViewComponent;
      })
    );
  }

  get pendingViewComponent() {
    const pendingViewUrl = this.pendingViewUrl
      ? this.app.file.project.absoluteFileUrl(this.pendingViewUrl)
      : undefined;
    return pendingViewUrl
      ? this.app.file.project.infrastructure.component(pendingViewUrl)
      : undefined;
  }

  get pendingViewComponent$() {
    return this.pendingViewUrl$.pipe(
      map((pendingViewUrl) => {
        if (!pendingViewUrl) {
          return undefined;
        }
        const pendingViewComponent =
          this.app.file.project.infrastructure.component(
            this.app.file.project.absoluteFileUrl(pendingViewUrl)
          );
        return pendingViewComponent;
      })
    );
  }

  get notFoundViewComponent() {
    const notFoundViewUrl = this.notFoundViewUrl
      ? this.app.file.project.absoluteFileUrl(this.notFoundViewUrl)
      : undefined;
    return notFoundViewUrl
      ? this.app.file.project.infrastructure.component(notFoundViewUrl)
      : undefined;
  }

  get notFoundViewComponent$() {
    return this.notFoundViewUrl$.pipe(
      map((notFoundViewUrl) => {
        if (!notFoundViewUrl) {
          return undefined;
        }
        const notFoundViewComponent =
          this.app.file.project.infrastructure.component(
            this.app.file.project.absoluteFileUrl(notFoundViewUrl)
          );
        return notFoundViewComponent;
      })
    );
  }

  get data(): RouteTreeData {
    return {
      ...super._data,
      ...this._state.record,
      children: this._children.data,
    };
  }

  get data$(): Observable<RouteTreeData> {
    return combineLatestMerged([
      super._data$,
      this._state.record$,
      combineLatest({
        children: this._children.data$,
      }),
    ]);
  }

  constructor({ init, app }: { init: RouteTreeData; app: StatefulRouter }) {
    const { children, id, ...stateData } = init;
    super({ id });

    this.app = app;

    this._state = new RecordState<Omit<RouteTreeData, "children" | "id">>({
      init: stateData,
    });

    this._children = new AggregatedModelList({
      init: children || [],
      create: (data) => new StatefulRouteTree({ init: data, app }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._children.dispose();
    });
  }

  setPath(path: string | undefined): void {
    this._state.set("path", path);
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

  addRoutes(routes: StatefulRouteTree[]): void {
    this._children.state.append(routes);
  }
  insertRoutes(index: number, routes: StatefulRouteTree[]): void {
    this._children.state.insertAt(index, routes);
  }
  removeRoutes(routes: StatefulRouteTree[]): void {
    const set = new Set(routes);
    this._children.state.remove((r) => set.has(r));
  }

  restore(data: RouteTreeData) {
    const { children, id, ...stateData } = data;

    super.restore({ id });
    this._state.setRecord(stateData);
    this._children.restore(children || []);
  }
}
