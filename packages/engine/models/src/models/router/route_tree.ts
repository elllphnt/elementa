import { RouteTreeData } from "@elllphnt/elementa-base";
import { AggregatedModelList, RecordState } from "@elllphnt/elementa-kernel";
import { map, Observable } from "rxjs";
import { Identifiable } from "../identifiable.js";
import { Router } from "./router.js";

export class RouteTree extends Identifiable<RouteTreeData> {
  readonly router: Router;

  private _children: AggregatedModelList<RecordState<RouteTreeData>, RouteTree>;

  constructor({
    state,
    router,
    initialized,
  }: {
    state: RecordState<RouteTreeData>;
    router: Router;
    initialized?: boolean;
  }) {
    super({ state, initialized, project: router.project });
    this.router = router;

    this._children = new AggregatedModelList<
      RecordState<RouteTreeData>,
      RouteTree
    >({
      state: state as any, // TODO: Fix proper child state typing
      create: (state) => new RouteTree({ state, router, initialized: true }),
    });

    this.addDisposer(() => {
      this._children.dispose();
    });
  }

  get children(): RouteTree[] {
    return this._children.models;
  }

  get children$(): Observable<RouteTree[]> {
    return this._children.models$;
  }

  get path() {
    return this.state.entry("path");
  }
  get path$() {
    return this.state.entry$("path");
  }

  get mainViewUrl() {
    return this.state.entry("mainViewUrl");
  }
  get mainViewUrl$() {
    return this.state.entry$("mainViewUrl");
  }

  get errorViewUrl() {
    return this.state.entry("errorViewUrl");
  }
  get errorViewUrl$() {
    return this.state.entry$("errorViewUrl");
  }

  get pendingViewUrl() {
    return this.state.entry("pendingViewUrl");
  }
  get pendingViewUrl$() {
    return this.state.entry$("pendingViewUrl");
  }

  get notFoundViewUrl() {
    return this.state.entry("notFoundViewUrl");
  }
  get notFoundViewUrl$() {
    return this.state.entry$("notFoundViewUrl");
  }

  get loaderUrl() {
    return this.state.entry("loaderUrl");
  }
  get loaderUrl$() {
    return this.state.entry$("loaderUrl");
  }

  get handlerUrl() {
    return this.state.entry("handlerUrl");
  }
  get handlerUrl$() {
    return this.state.entry$("handlerUrl");
  }

  get mainViewComponent() {
    const url = this.mainViewUrl;
    return url ? this.router.project.infrastructure.component(url) : undefined;
  }

  get mainViewComponent$() {
    return this.mainViewUrl$.pipe(
      map((url) =>
        url ? this.router.project.infrastructure.component(url) : undefined
      )
    );
  }

  get errorViewComponent() {
    const url = this.errorViewUrl;
    return url ? this.router.project.infrastructure.component(url) : undefined;
  }

  get errorViewComponent$() {
    return this.errorViewUrl$.pipe(
      map((url) =>
        url ? this.router.project.infrastructure.component(url) : undefined
      )
    );
  }

  get pendingViewComponent() {
    const url = this.pendingViewUrl;
    return url ? this.router.project.infrastructure.component(url) : undefined;
  }

  get pendingViewComponent$() {
    return this.pendingViewUrl$.pipe(
      map((url) =>
        url ? this.router.project.infrastructure.component(url) : undefined
      )
    );
  }

  get notFoundViewComponent() {
    const url = this.notFoundViewUrl;
    return url ? this.router.project.infrastructure.component(url) : undefined;
  }

  get notFoundViewComponent$() {
    return this.notFoundViewUrl$.pipe(
      map((url) =>
        url ? this.router.project.infrastructure.component(url) : undefined
      )
    );
  }

  setPath(value: string | undefined): void {
    this.state.set("path", value);
  }

  setMainViewUrl(url: string | undefined): void {
    this.state.set("mainViewUrl", url);
  }

  setErrorViewUrl(url: string | undefined): void {
    this.state.set("errorViewUrl", url);
  }

  setPendingViewUrl(url: string | undefined): void {
    this.state.set("pendingViewUrl", url);
  }

  setNotFoundViewUrl(url: string | undefined): void {
    this.state.set("notFoundViewUrl", url);
  }

  setLoaderUrl(url: string | undefined): void {
    this.state.set("loaderUrl", url);
  }

  setHandlerUrl(url: string | undefined): void {
    this.state.set("handlerUrl", url);
  }

  setParentId(id: string | undefined): void {
    this.state.set("parentId", id);
  }

  // TODO: Update methods to match AggregatedModelList interface
  // addRoutes(routes: RouteTreeModel[]): void {
  //   this._children.add(routes);
  // }
  // insertRoutes(index: number, routes: RouteTreeModel[]): void {
  //   this._children.insert(index, routes);
  // }
  // removeRoutes(routes: RouteTreeModel[]): void {
  //   this._children.remove(routes);
  // }
}
