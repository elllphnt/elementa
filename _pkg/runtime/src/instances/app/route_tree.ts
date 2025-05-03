import { RouteTree, SlotFill } from "@elllphnt/elementa-models";
import { reconcileList } from "@elllphnt/elementa-utils";
import { BehaviorSubject, Observable, of, switchMap } from "rxjs";
import { ComponentInstance } from "../component/component";
import { ComponentPropResolver } from "../component/prop_resolver";
import { FragmentEnvironment } from "../fragment/_";
import { Instance, InstanceType } from "../instance";

export class RouteComponentPropResolver extends ComponentPropResolver {
  propValue() {
    return undefined;
  }
  propValue$() {
    return of(undefined);
  }
  slotFill(id: string): SlotFill | undefined {
    return undefined;
  }
  slotFill$(id: string): Observable<SlotFill | undefined> {
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
    const url = this.model.absoluteLoaderUrl;
    return url ? this.runtime.moduleManager.module(url) : undefined;
  }

  get handlerModule() {
    const url = this.model.absoluteHandlerUrl;
    return url ? this.runtime.moduleManager.module(url) : undefined;
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
      type: InstanceType.Route,
      runtime: environment.runtime,
      parent,
    });
    this.model = routeTree;

    const viewSubscriptions = (
      ["mainView", "errorView", "pendingView", "notFoundView"] as const
    ).map((viewKey) => {
      const subscription = this.model[`${viewKey}Component$`]
        .pipe(switchMap((c) => c?.model$ ?? of(undefined)))
        .subscribe((view) => {
          if (view) {
            this[`_${viewKey}$`].next(
              new ComponentInstance({
                component: view,
                propResolver: new RouteComponentPropResolver({ environment }),
              })
            );
          } else {
            this[`_${viewKey}$`].next(undefined);
          }
        });

      return subscription;
    });

    const childrenSubscription = this.model.children.observable$.subscribe(
      (children) => {
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
      }
    );

    this.addDisposer(() => {
      viewSubscriptions.forEach((subscription) => subscription.unsubscribe());
      childrenSubscription.unsubscribe();
      this._mainView$.complete();
      this._pendingView$.complete();
      this._errorView$.complete();
      this._notFoundView$.complete();
      this._children$.complete();
    });
  }
}
