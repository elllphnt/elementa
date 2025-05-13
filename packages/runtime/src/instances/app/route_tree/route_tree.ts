import { RouteTree } from "@elllphnt/elementa-models";
import { reconcileList } from "@elllphnt/elementa-utils";
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { FragmentEnvironment } from "../../fragment/_.js";
import { ElementaInstanceType, Instance } from "../../instance.js";
import { ModelInstance } from "../../model.js";
import { RouteHandler } from "./content/_content.js";
import { FunctionRouteHandler } from "./content/function.js";
import { PageRouteHandler } from "./content/page.js";

export class RouteTreeInstance extends ModelInstance<RouteTree> {
  private _handler$ = new BehaviorSubject<RouteHandler | undefined>(undefined);
  private _children$ = new BehaviorSubject<RouteTreeInstance[]>([]);

  get handler$(): Observable<RouteHandler | undefined> {
    return this._handler$;
  }
  get handler(): RouteHandler | undefined {
    return this._handler$.value;
  }

  get children$(): Observable<RouteTreeInstance[]> {
    return this._children$.asObservable();
  }
  get children(): RouteTreeInstance[] {
    return this._children$.value;
  }

  get diagnosticLevel(): number {
    return Math.max(
      this.ownDiagnosticLevel,
      this.handler?.diagnosticLevel ?? 0
    );
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.handler$.pipe(
        switchMap((content) => content?.diagnosticLevel$ ?? of(0))
      ),
    ]).pipe(map(([own, content]) => Math.max(own, content)));
  }

  constructor({
    environment,
    model,
    parent,
  }: {
    environment: FragmentEnvironment;
    model: RouteTree;
    parent?: Instance;
  }) {
    super({
      model,
      type: ElementaInstanceType.Route,
      runtime: environment.runtime,
      parent,
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
            model: route,
            parent: this,
          }),
      });
      this._children$.next(nextChildren);
      removed.forEach((route) => {
        route.dispose();
      });
    });

    const handlerSubscription = this.model.handlerUrl$
      .pipe(
        map((handlerUrl) => Boolean(handlerUrl)),
        distinctUntilChanged()
      )
      .subscribe((isFunction) => {
        const current = this.handler;
        if (isFunction) {
          this._handler$.next(
            new FunctionRouteHandler({
              environment,
              routeTree: this.model,
              parent: this,
            })
          );
        } else {
          this._handler$.next(
            new PageRouteHandler({
              environment,
              routeTree: this.model,
              parent: this,
            })
          );
        }
        current?.dispose();
      });

    this.addDisposer(() => {
      childrenSubscription.unsubscribe();
      handlerSubscription.unsubscribe();
      this._children$.complete();
      this._handler$.complete();
    });
  }
}
