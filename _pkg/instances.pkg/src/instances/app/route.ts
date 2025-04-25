import { FragmentParam, Prop, Route, SlotFill } from "@repo/elementa-models";
import { Disposable } from "@repo/utils";
import { BehaviorSubject, Observable, of } from "rxjs";
import { FragmentEnvironment } from "../_";
import {
  ComponentInstance,
  ComponentPropResolver,
} from "../component/component";

export class RouteComponentPropResolver extends ComponentPropResolver {
  get paged(): boolean {
    return false;
  }
  get paged$(): Observable<boolean> {
    return of(false);
  }
  propValue(prop: Prop) {
    return undefined;
  }
  propValue$(prop: Prop): Observable<any> {
    return of(undefined);
  }
  paramValue(param: FragmentParam) {
    return undefined;
  }
  paramValue$(param: FragmentParam): Observable<any> {
    return of(undefined);
  }
  slotFill(id: string): SlotFill | undefined {
    return undefined;
  }
  slotFill$(id: string): Observable<SlotFill | undefined> {
    return of(undefined);
  }
}

export class RouteInstance extends Disposable {
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  readonly key = `${RouteInstance.keySeed}-${RouteInstance.key++}`;
  readonly route: Route;

  private _view$ = new BehaviorSubject<ComponentInstance | undefined>(
    undefined,
  );
  private _layout$ = new BehaviorSubject<ComponentInstance | undefined>(
    undefined,
  );

  get view$(): Observable<ComponentInstance | undefined> {
    return this._view$;
  }
  get view(): ComponentInstance | undefined {
    return this._view$.value;
  }

  get layout$(): Observable<ComponentInstance | undefined> {
    return this._layout$;
  }
  get layout(): ComponentInstance | undefined {
    return this._layout$.value;
  }

  constructor({
    environment,
    route,
  }: {
    environment: FragmentEnvironment;
    route: Route;
  }) {
    super();
    this.route = route;

    const viewSubscription = this.route.view$.subscribe((view) => {
      if (view) {
        this._view$.next(
          new ComponentInstance({
            component: view,
            propResolver: new RouteComponentPropResolver({ environment }),
          }),
        );
      } else {
        this._view$.next(undefined);
      }
    });
    const layoutSubscription = this.route.layout$.subscribe((layout) => {
      if (layout) {
        this._layout$.next(
          new ComponentInstance({
            component: layout,
            propResolver: new RouteComponentPropResolver({ environment }),
          }),
        );
      } else {
        this._layout$.next(undefined);
      }
    });

    this.addDisposer(() => {
      viewSubscription.unsubscribe();
      layoutSubscription.unsubscribe();
    });
  }
}
