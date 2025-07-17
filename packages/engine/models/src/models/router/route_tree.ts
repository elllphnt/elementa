import type { ImportReference, RouteTreeData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { AggregatedModelList } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import { map } from "rxjs";
import { Identifiable } from "../identifiable.js";
import type { Router } from "./router.js";

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
      state: state.getListOfRecordStates("children"),
      create: (state) => new RouteTree({ state, router, initialized: true }),
    });

    this.addInitializer(() => {
      this._children.initialize();

      this.addDisposer(() => {
        this._children.dispose();
      });
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

  get mainViewRef() {
    return this.state.entry("mainViewRef");
  }
  get mainViewRef$() {
    return this.state.entry$("mainViewRef");
  }

  get errorViewRef() {
    return this.state.entry("errorViewRef");
  }
  get errorViewRef$() {
    return this.state.entry$("errorViewRef");
  }

  get pendingViewRef() {
    return this.state.entry("pendingViewRef");
  }
  get pendingViewRef$() {
    return this.state.entry$("pendingViewRef");
  }

  get notFoundViewRef() {
    return this.state.entry("notFoundViewRef");
  }
  get notFoundViewRef$() {
    return this.state.entry$("notFoundViewRef");
  }

  get loaderRef() {
    return this.state.entry("loaderRef");
  }
  get loaderRef$() {
    return this.state.entry$("loaderRef");
  }

  get handlerRef() {
    return this.state.entry("handlerRef");
  }
  get handlerRef$() {
    return this.state.entry$("handlerRef");
  }

  get mainViewComponent() {
    const ref = this.mainViewRef;
    return ref
      ? this.router.project.infrastructure.component(
          this.router.project.absoluteFileUrl(ref.__import.module)
        )
      : undefined;
  }

  get mainViewComponent$() {
    return this.mainViewRef$.pipe(
      map((ref) =>
        ref
          ? this.router.project.infrastructure.component(
              this.router.project.absoluteFileUrl(ref.__import.module)
            )
          : undefined
      )
    );
  }

  get errorViewComponent() {
    const ref = this.errorViewRef;
    return ref
      ? this.router.project.infrastructure.component(
          this.router.project.absoluteFileUrl(ref.__import.module)
        )
      : undefined;
  }

  get errorViewComponent$() {
    return this.errorViewRef$.pipe(
      map((ref) =>
        ref
          ? this.router.project.infrastructure.component(
              this.router.project.absoluteFileUrl(ref.__import.module)
            )
          : undefined
      )
    );
  }

  get pendingViewComponent() {
    const ref = this.pendingViewRef;
    return ref
      ? this.router.project.infrastructure.component(
          this.router.project.absoluteFileUrl(ref.__import.module)
        )
      : undefined;
  }

  get pendingViewComponent$() {
    return this.pendingViewRef$.pipe(
      map((ref) =>
        ref
          ? this.router.project.infrastructure.component(
              this.router.project.absoluteFileUrl(ref.__import.module)
            )
          : undefined
      )
    );
  }

  get notFoundViewComponent() {
    const ref = this.notFoundViewRef;
    return ref
      ? this.router.project.infrastructure.component(
          this.router.project.absoluteFileUrl(ref.__import.module)
        )
      : undefined;
  }

  get notFoundViewComponent$() {
    return this.notFoundViewRef$.pipe(
      map((ref) =>
        ref
          ? this.router.project.infrastructure.component(
              this.router.project.absoluteFileUrl(ref.__import.module)
            )
          : undefined
      )
    );
  }

  setPath(value: string | undefined): void {
    this.state.set("path", value);
  }

  setMainViewRef(ref: ImportReference | undefined): void {
    this.state.set("mainViewRef", ref);
  }

  setErrorViewRef(ref: ImportReference | undefined): void {
    this.state.set("errorViewRef", ref);
  }

  setPendingViewRef(ref: ImportReference | undefined): void {
    this.state.set("pendingViewRef", ref);
  }

  setNotFoundViewRef(ref: ImportReference | undefined): void {
    this.state.set("notFoundViewRef", ref);
  }

  setLoaderRef(ref: ImportReference | undefined): void {
    this.state.set("loaderRef", ref);
  }

  setHandlerRef(ref: ImportReference | undefined): void {
    this.state.set("handlerRef", ref);
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
