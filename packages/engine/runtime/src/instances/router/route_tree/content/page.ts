import type {
  Component,
  FileModelAdaptor,
  RouteTree,
  SlotFill,
} from "@elllphnt/elementa-models";
import type {
  Observable} from "rxjs";
import {
  BehaviorSubject,
  combineLatest,
  map,
  of,
  switchMap,
} from "rxjs";
import { ModelInstanceAdaptor } from "~/instances/adaptors/model.js";
import { ComponentInstance } from "~/instances/component/component.js";
import { ComponentInputResolver } from "~/instances/component/input_resolver/input_resolver.js";
import type { ElementRuntimeEnvironment } from "~/instances/elements/_environment/environment.js";
import type { Instance } from "../../../instance.js";
import { BaseRouteHandler } from "./_base.js";

export class RouteComponentPropResolver extends ComponentInputResolver {
  propValue() {
    return undefined;
  }
  propValue$() {
    return of(undefined);
  }
  slotFill(): SlotFill | undefined {
    return undefined;
  }
  slotFill$(): Observable<SlotFill | undefined> {
    return of(undefined);
  }
}

export class PageRouteHandler extends BaseRouteHandler<"page"> {
  readonly route: RouteTree;

  private _mainView$ = new BehaviorSubject<
    | ModelInstanceAdaptor<
        Component,
        ComponentInstance,
        FileModelAdaptor<"component">
      >
    | undefined
  >(undefined);
  private _errorView$ = new BehaviorSubject<
    | ModelInstanceAdaptor<
        Component,
        ComponentInstance,
        FileModelAdaptor<"component">
      >
    | undefined
  >(undefined);
  private _pendingView$ = new BehaviorSubject<
    | ModelInstanceAdaptor<
        Component,
        ComponentInstance,
        FileModelAdaptor<"component">
      >
    | undefined
  >(undefined);
  private _notFoundView$ = new BehaviorSubject<
    | ModelInstanceAdaptor<
        Component,
        ComponentInstance,
        FileModelAdaptor<"component">
      >
    | undefined
  >(undefined);

  get mainView$(): Observable<
    | ModelInstanceAdaptor<
        Component,
        ComponentInstance,
        FileModelAdaptor<"component">
      >
    | undefined
  > {
    return this._mainView$;
  }
  get mainView():
    | ModelInstanceAdaptor<
        Component,
        ComponentInstance,
        FileModelAdaptor<"component">
      >
    | undefined {
    return this._mainView$.value;
  }

  get errorView$(): Observable<
    | ModelInstanceAdaptor<
        Component,
        ComponentInstance,
        FileModelAdaptor<"component">
      >
    | undefined
  > {
    return this._errorView$;
  }
  get errorView():
    | ModelInstanceAdaptor<
        Component,
        ComponentInstance,
        FileModelAdaptor<"component">
      >
    | undefined {
    return this._errorView$.value;
  }

  get pendingView$(): Observable<
    | ModelInstanceAdaptor<
        Component,
        ComponentInstance,
        FileModelAdaptor<"component">
      >
    | undefined
  > {
    return this._pendingView$;
  }
  get pendingView():
    | ModelInstanceAdaptor<
        Component,
        ComponentInstance,
        FileModelAdaptor<"component">
      >
    | undefined {
    return this._pendingView$.value;
  }

  get notFoundView$(): Observable<
    | ModelInstanceAdaptor<
        Component,
        ComponentInstance,
        FileModelAdaptor<"component">
      >
    | undefined
  > {
    return this._notFoundView$;
  }
  get notFoundView():
    | ModelInstanceAdaptor<
        Component,
        ComponentInstance,
        FileModelAdaptor<"component">
      >
    | undefined {
    return this._notFoundView$.value;
  }

  get loaderModule() {
    return this.route.loaderUrl
      ? this.runtime.moduleManager.module(
          this.route.project.absoluteFileUrl(this.route.loaderUrl)
        )
      : undefined;
  }
  get loaderModule$() {
    return this.route.loaderUrl$.pipe(
      map((url) => {
        return url
          ? this.runtime.moduleManager.module(
              this.route.project.absoluteFileUrl(url)
            )
          : undefined;
      })
    );
  }

  get diagnosticLevel(): number {
    const viewsLevel = Math.max(
      this.mainView?.diagnosticLevel ?? 0,
      this.errorView?.diagnosticLevel ?? 0,
      this.pendingView?.diagnosticLevel ?? 0,
      this.notFoundView?.diagnosticLevel ?? 0,
      this.loaderModule?.diagnosticLevel ?? 0
    );

    return Math.max(this.ownDiagnosticLevel, viewsLevel);
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.mainView$.pipe(switchMap((view) => view?.diagnosticLevel$ ?? of(0))),
      this.errorView$.pipe(
        switchMap((view) => view?.diagnosticLevel$ ?? of(0))
      ),
      this.pendingView$.pipe(
        switchMap((view) => view?.diagnosticLevel$ ?? of(0))
      ),
      this.notFoundView$.pipe(
        switchMap((view) => view?.diagnosticLevel$ ?? of(0))
      ),
      this.loaderModule$.pipe(
        switchMap((module) => module?.diagnosticLevel$ ?? of(0))
      ),
    ]).pipe(
      map(([own, main, error, pending, notFound, loader]) =>
        Math.max(own, main, error, pending, notFound, loader)
      )
    );
  }

  constructor({
    environment,
    routeTree,
    parent,
  }: {
    environment: ElementRuntimeEnvironment;
    routeTree: RouteTree;
    parent?: Instance;
  }) {
    super({
      variant: "page",
      environment,
      routeTree,
      parent,
    });
    this.route = routeTree;

    const mainViewSubscription = this.route.mainViewComponent$.subscribe(
      (modelAdaptor) => {
        const current = this.mainView;
        if (modelAdaptor) {
          const adaptor = new ModelInstanceAdaptor<
            Component,
            ComponentInstance,
            FileModelAdaptor<"component">
          >({
            modelAdaptor,
            runtime: this.runtime,
            create: (model) => {
              return new ComponentInstance({
                model,
                inputResolver: new RouteComponentPropResolver({ environment }),
              });
            },
          });
          this._mainView$.next(adaptor);
        } else {
          this._mainView$.next(undefined);
        }
        current?.dispose();
      }
    );

    const errorViewSubscription = this.route.errorViewComponent$.subscribe(
      (modelAdaptor) => {
        const current = this.errorView;
        if (modelAdaptor) {
          const adaptor = new ModelInstanceAdaptor<
            Component,
            ComponentInstance,
            FileModelAdaptor<"component">
          >({
            modelAdaptor,
            runtime: this.runtime,
            create: (model) => {
              return new ComponentInstance({
                model,
                inputResolver: new RouteComponentPropResolver({ environment }),
              });
            },
          });
          this._errorView$.next(adaptor);
        } else {
          this._errorView$.next(undefined);
        }
        current?.dispose();
      }
    );

    const pendingViewSubscription = this.route.pendingViewComponent$.subscribe(
      (modelAdaptor) => {
        const current = this.pendingView;
        if (modelAdaptor) {
          const adaptor = new ModelInstanceAdaptor<
            Component,
            ComponentInstance,
            FileModelAdaptor<"component">
          >({
            modelAdaptor,
            runtime: this.runtime,
            create: (model) => {
              return new ComponentInstance({
                model,
                inputResolver: new RouteComponentPropResolver({ environment }),
              });
            },
          });
          this._pendingView$.next(adaptor);
        } else {
          this._pendingView$.next(undefined);
        }
        current?.dispose();
      }
    );

    const notFoundViewSubscription =
      this.route.notFoundViewComponent$.subscribe((modelAdaptor) => {
        const current = this.notFoundView;
        if (modelAdaptor) {
          const adaptor = new ModelInstanceAdaptor<
            Component,
            ComponentInstance,
            FileModelAdaptor<"component">
          >({
            modelAdaptor,
            runtime: this.runtime,
            create: (model) => {
              return new ComponentInstance({
                model,
                inputResolver: new RouteComponentPropResolver({ environment }),
              });
            },
          });
          this._notFoundView$.next(adaptor);
        } else {
          this._notFoundView$.next(undefined);
        }
        current?.dispose();
      });

    this.addDisposer(() => {
      mainViewSubscription.unsubscribe();
      errorViewSubscription.unsubscribe();
      pendingViewSubscription.unsubscribe();
      notFoundViewSubscription.unsubscribe();
      this._mainView$.complete();
      this._errorView$.complete();
      this._pendingView$.complete();
      this._notFoundView$.complete();
    });
  }
}
