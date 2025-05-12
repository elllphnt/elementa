import { RouteTree, SlotFill } from "@elllphnt/elementa-models";
import { combineLatestOrEmpty, reconcileList } from "@elllphnt/elementa-utils";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { ComponentInstance } from "../component/component.js";
import { ComponentInputResolver } from "../component/input_resolver/input_resolver.js";
import { FragmentEnvironment } from "../fragment/_.js";
import { ElementaInstanceType, Instance } from "../instance.js";

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

export class RouteTreeInstance extends Instance {
  readonly model: RouteTree;

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
  private _children$ = new BehaviorSubject<RouteTreeInstance[]>([]);

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

  get children$(): Observable<RouteTreeInstance[]> {
    return this._children$.asObservable();
  }
  get children(): RouteTreeInstance[] {
    return this._children$.value;
  }

  get loaderModule() {
    return this.model.loaderUrl
      ? this.runtime.moduleManager.module(
          this.model.app.project.absoluteFileUrl(this.model.loaderUrl)
        )
      : undefined;
  }
  get loaderModule$() {
    return this.model.loaderUrl$.pipe(
      map((url) => {
        return url
          ? this.runtime.moduleManager.module(
              this.model.app.project.absoluteFileUrl(url)
            )
          : undefined;
      })
    );
  }

  get handlerModule() {
    return this.model.handlerUrl
      ? this.runtime.moduleManager.module(
          this.model.app.project.absoluteFileUrl(this.model.handlerUrl)
        )
      : undefined;
  }
  get handlerModule$() {
    return this.model.handlerUrl$.pipe(
      map((url) => {
        return url
          ? this.runtime.moduleManager.module(
              this.model.app.project.absoluteFileUrl(url)
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
      this.notFoundView?.diagnosticLevel ?? 0
    );

    return Math.max(
      this.ownDiagnosticLevel,
      viewsLevel,
      ...this.children.map((r) => r.diagnosticLevel)
    );
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
      this.children$.pipe(
        switchMap((children) =>
          combineLatestOrEmpty(children.map((c) => c.diagnosticLevel$))
        )
      ),
    ]).pipe(
      map(([own, main, pending, error, notFound, childLevels]) =>
        Math.max(own, main, pending, error, notFound, ...childLevels)
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
      type: ElementaInstanceType.Route,
      runtime: environment.runtime,
      parent,
    });
    this.model = routeTree;

    const mainViewSubscription = this.model.mainViewComponent$
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

    const errorViewSubscription = this.model.errorViewComponent$
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

    const pendingViewSubscription = this.model.pendingViewComponent$
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

    const notFoundViewSubscription = this.model.notFoundViewComponent$
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

    const childrenSubscription = this.model.children$.subscribe((children) => {
      const [nextChildren, removed] = reconcileList({
        targets: this._children$.value,
        sources: children,
        sourceRef: (r) => r,
        targetRef: (r) => r.model,
        create: (route) =>
          new RouteTreeInstance({
            environment,
            routeTree: route,
            parent: this,
          }),
      });
      this._children$.next(nextChildren);
      removed.forEach((route) => {
        route.dispose();
      });
    });

    this.addDisposer(() => {
      mainViewSubscription.unsubscribe();
      errorViewSubscription.unsubscribe();
      pendingViewSubscription.unsubscribe();
      notFoundViewSubscription.unsubscribe();
      childrenSubscription.unsubscribe();
      this._mainView$.complete();
      this._pendingView$.complete();
      this._errorView$.complete();
      this._notFoundView$.complete();
      this._children$.complete();
    });
  }
}
