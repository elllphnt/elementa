import { RouteTree, SlotFill } from "@elllphnt/elementa-models";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import {
  ComponentInputResolver,
  ComponentInstance,
} from "../../../component/_.js";
import { FragmentEnvironment } from "../../../fragment/_.js";
import { Instance } from "../../../instance.js";
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

  private _mainView$ = new BehaviorSubject<ComponentInstance | undefined>(
    undefined
  );
  private _pendingView$ = new BehaviorSubject<ComponentInstance | undefined>(
    undefined
  );
  private _errorView$ = new BehaviorSubject<ComponentInstance | undefined>(
    undefined
  );
  private _notFoundView$ = new BehaviorSubject<ComponentInstance | undefined>(
    undefined
  );

  get mainView$(): Observable<ComponentInstance | undefined> {
    return this._mainView$;
  }
  get mainView(): ComponentInstance | undefined {
    return this._mainView$.value;
  }

  get pendingView$(): Observable<ComponentInstance | undefined> {
    return this._pendingView$;
  }
  get pendingView(): ComponentInstance | undefined {
    return this._pendingView$.value;
  }

  get errorView$(): Observable<ComponentInstance | undefined> {
    return this._errorView$;
  }
  get errorView(): ComponentInstance | undefined {
    return this._errorView$.value;
  }

  get notFoundView$(): Observable<ComponentInstance | undefined> {
    return this._notFoundView$;
  }
  get notFoundView(): ComponentInstance | undefined {
    return this._notFoundView$.value;
  }

  get loaderModule() {
    return this.route.loaderUrl
      ? this.runtime.moduleManager.module(
          this.route.app.file.project.absoluteFileUrl(this.route.loaderUrl)
        )
      : undefined;
  }
  get loaderModule$() {
    return this.route.loaderUrl$.pipe(
      map((url) => {
        return url
          ? this.runtime.moduleManager.module(
              this.route.app.file.project.absoluteFileUrl(url)
            )
          : undefined;
      })
    );
  }

  get diagnosticLevel(): number {
    const viewsLevel = Math.max(
      this.mainView?.diagnosticLevel ?? 0,
      this.pendingView?.diagnosticLevel ?? 0,
      this.errorView?.diagnosticLevel ?? 0,
      this.notFoundView?.diagnosticLevel ?? 0,
      this.loaderModule?.diagnosticLevel ?? 0
    );

    return Math.max(this.ownDiagnosticLevel, viewsLevel);
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.mainView$.pipe(switchMap((view) => view?.diagnosticLevel$ ?? of(0))),
      this.pendingView$.pipe(
        switchMap((view) => view?.diagnosticLevel$ ?? of(0))
      ),
      this.errorView$.pipe(
        switchMap((view) => view?.diagnosticLevel$ ?? of(0))
      ),
      this.notFoundView$.pipe(
        switchMap((view) => view?.diagnosticLevel$ ?? of(0))
      ),
      this.loaderModule$.pipe(
        switchMap((module) => module?.diagnosticLevel$ ?? of(0))
      ),
    ]).pipe(
      map(([own, main, pending, error, notFound, loader]) =>
        Math.max(own, main, pending, error, notFound, loader)
      )
    );
  }

  constructor({
    environment,
    routeTree,
    parent,
  }: {
    environment: FragmentEnvironment;
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

    const mainViewSubscription = this.route.mainViewComponent$
      .pipe(switchMap((c) => c?.model$ ?? of(undefined)))
      .subscribe((view) => {
        if (view) {
          this._mainView$.next(
            new ComponentInstance({
              component: view,
              inputResolver: new RouteComponentPropResolver({ environment }),
            })
          );
        } else {
          this._mainView$.next(undefined);
        }
      });

    const errorViewSubscription = this.route.errorViewComponent$
      .pipe(switchMap((c) => c?.model$ ?? of(undefined)))
      .subscribe((view) => {
        if (view) {
          this._errorView$.next(
            new ComponentInstance({
              component: view,
              inputResolver: new RouteComponentPropResolver({ environment }),
            })
          );
        } else {
          this._errorView$.next(undefined);
        }
      });

    const pendingViewSubscription = this.route.pendingViewComponent$
      .pipe(switchMap((c) => c?.model$ ?? of(undefined)))
      .subscribe((view) => {
        if (view) {
          this._pendingView$.next(
            new ComponentInstance({
              component: view,
              inputResolver: new RouteComponentPropResolver({ environment }),
            })
          );
        } else {
          this._pendingView$.next(undefined);
        }
      });

    const notFoundViewSubscription = this.route.notFoundViewComponent$
      .pipe(switchMap((c) => c?.model$ ?? of(undefined)))
      .subscribe((view) => {
        if (view) {
          this._notFoundView$.next(
            new ComponentInstance({
              component: view,
              inputResolver: new RouteComponentPropResolver({ environment }),
            })
          );
        } else {
          this._notFoundView$.next(undefined);
        }
      });

    this.addDisposer(() => {
      mainViewSubscription.unsubscribe();
      errorViewSubscription.unsubscribe();
      pendingViewSubscription.unsubscribe();
      notFoundViewSubscription.unsubscribe();
      this._mainView$.complete();
      this._pendingView$.complete();
      this._errorView$.complete();
      this._notFoundView$.complete();
    });
  }
}
