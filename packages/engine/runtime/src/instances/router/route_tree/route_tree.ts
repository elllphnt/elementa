import { reconcileList } from "@elllphnt/elementa-kernel";
import type { RouteTree } from "@elllphnt/elementa-models";
import type { Observable } from "rxjs";
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from "rxjs";
import type { ElementRuntimeEnvironment } from "~/instances/elements/_environment/environment.js";
import type { Instance } from "../../instance.js";
import { ElementaInstanceType } from "../../instance.js";
import { ModelInstance } from "../../model.js";
import type { RouteHandler } from "./content/_content.js";
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
    environment: ElementRuntimeEnvironment;
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
        create: (route) => {
          const instance = new RouteTreeInstance({
            environment,
            model: route,
            parent: this,
          });
          this.addLifecycle(instance);
          return instance;
        },
      });
      this._children$.next(nextChildren);
      removed.forEach((route) => {
        this.removeLifecycle(route);
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
          const handler = new FunctionRouteHandler({
            environment,
            routeTree: this.model,
            parent: this,
          });
          this.addLifecycle(handler);
          this._handler$.next(handler);
        } else {
          const handler = new PageRouteHandler({
            environment,
            routeTree: this.model,
            parent: this,
          });
          this.addLifecycle(handler);
          this._handler$.next(handler);
        }
        if (current) {
          this.removeLifecycle(current);
          current.dispose();
        }
      });

    this.addDisposer(() => {
      childrenSubscription.unsubscribe();
      handlerSubscription.unsubscribe();

      this.children.forEach((child) => {
        this.removeLifecycle(child);
        child.dispose();
      });

      if (this.handler) {
        this.removeLifecycle(this.handler);
        this.handler.dispose();
      }

      this._children$.complete();
      this._handler$.complete();
    });
  }
}
