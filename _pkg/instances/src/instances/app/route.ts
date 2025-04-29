import { Route, SlotFill } from "@elllphnt/elementa-models";
import { BehaviorSubject, Observable, of, switchMap } from "rxjs";
import { FragmentEnvironment, Instance } from "../_";
import { ComponentInstance } from "../component/component";
import { ComponentPropResolver } from "../component/prop_resolver";

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

export class RouteInstance extends Instance {
  readonly route: Route;

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
    const url = this.route.absoluteLoaderUrl;
    return url ? this.elementa.moduleManager.module(url) : undefined;
  }
  get loaderModule$() {
    return this.route.absoluteLoaderUrl$.pipe(
      switchMap((url) => {
        return url ? this.elementa.moduleManager.module$(url) : of(undefined);
      })
    );
  }

  get handlerModule() {
    const url = this.route.absoluteHandlerUrl;
    return url ? this.elementa.moduleManager.module(url) : undefined;
  }
  get handlerModule$() {
    return this.route.absoluteHandlerUrl$.pipe(
      switchMap((url) => {
        return url ? this.elementa.moduleManager.module$(url) : of(undefined);
      })
    );
  }

  constructor({
    environment,
    route,
  }: {
    environment: FragmentEnvironment;
    route: Route;
  }) {
    super(environment.elementa);
    this.route = route;

    const viewSubscriptions = (
      ["mainView", "errorView", "pendingView", "notFoundView"] as const
    ).map((viewKey) => {
      const subscription = this.route[`${viewKey}Component$`].subscribe(
        (view) => {
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
        }
      );

      return subscription;
    });

    this.addDisposer(() => {
      viewSubscriptions.forEach((subscription) => subscription.unsubscribe());
      this._mainView$.complete();
      this._pendingView$.complete();
      this._errorView$.complete();
      this._notFoundView$.complete();
    });
  }
}
