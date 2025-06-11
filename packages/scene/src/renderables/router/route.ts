import { RouteTreeInstance } from "@elllphnt/elementa-runtime";
import { reconcileList } from "@elllphnt/elementa-utils";
import { createRoute, RootRoute, Route } from "@tanstack/react-router";
import React, { createElement } from "react";
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from "rxjs";
import { RouteViewComponent } from "../../components/app/route_view.js";
import { Scene } from "../../scene/scene.js";
import { Renderable } from "../renderable.js";
import { RouteHandlerRenderable } from "./route_handler.js";

export type TsRouteComponentOptions = Partial<
  Record<
    "component" | "errorComponent" | "pendingComponent" | "notFoundComponent",
    React.ComponentType
  >
>;

export class RouteTreeRenderable extends Renderable {
  readonly instance: RouteTreeInstance;

  private _onStructure: () => void;
  private _children$ = new BehaviorSubject<RouteTreeRenderable[]>([]);
  private _handler$ = new BehaviorSubject<RouteHandlerRenderable | undefined>(
    undefined
  );

  private _tsComponentOptions: TsRouteComponentOptions = {};

  get children$() {
    return this._children$.asObservable();
  }
  get children() {
    return this._children$.value;
  }

  get handler$() {
    return this._handler$.asObservable();
  }
  get handler() {
    return this._handler$.value;
  }

  constructor({
    scene,
    route,
    onStructure,
  }: {
    scene: Scene;
    route: RouteTreeInstance;
    onStructure: () => void;
  }) {
    super({ scene });
    this.instance = route;
    this._onStructure = onStructure;

    const childrenSubscription = this.instance.children$.subscribe(
      (children) => {
        const [nextChildren, removed] = reconcileList({
          sources: children,
          targets: this.children,
          sourceRef: (r) => r,
          targetRef: (r) => r.instance,
          create: (child) =>
            new RouteTreeRenderable({
              scene,
              route: child,
              onStructure: this._onStructure,
            }),
        });

        this._children$.next(nextChildren);
        removed.forEach((child) => child.dispose());
        this._onStructure();
      }
    );

    const handlerSubscription = this.instance.handler$
      .pipe(
        map((handler) => (handler?.variant === "page" ? handler : undefined))
      )
      .subscribe((handler) => {
        const currentView = this._handler$.value;
        if (handler) {
          this._handler$.next(
            new RouteHandlerRenderable({
              scene,
              instance: handler,
            })
          );
        } else {
          this._handler$.next(undefined);
        }
        if (currentView) {
          currentView.dispose();
        }
      });

    // call onStructure when views change
    const viewsSubscription = this.handler$
      .pipe(
        distinctUntilChanged(),
        switchMap((handler) =>
          handler
            ? combineLatest({
                mainView: handler.mainView$,
                errorView: handler.errorView$,
                pendingView: handler.pendingView$,
                notFoundView: handler.notFoundView$,
              })
            : of(undefined)
        ),
        distinctUntilChanged()
      )
      .subscribe((views) => {
        this._tsComponentOptions = {};
        if (views?.mainView) {
          const view = views.mainView;
          this._tsComponentOptions.component = () =>
            createElement(RouteViewComponent, { key: view.key, view });
        }
        if (views?.errorView) {
          const view = views.errorView;
          this._tsComponentOptions.component = () =>
            createElement(RouteViewComponent, { key: view.key, view });
        }
        if (views?.notFoundView) {
          const view = views.notFoundView;
          this._tsComponentOptions.component = () =>
            createElement(RouteViewComponent, { key: view.key, view });
        }
        if (views?.pendingView) {
          const view = views.pendingView;
          this._tsComponentOptions.component = () =>
            createElement(RouteViewComponent, { key: view.key, view });
        }

        onStructure();
      });

    this.addDisposer(() => {
      this._children$.complete();
      this._handler$.complete();

      childrenSubscription.unsubscribe();
      handlerSubscription.unsubscribe();
      viewsSubscription.unsubscribe();
    });
  }

  createTsRoute(parent: RootRoute | Route): Route | undefined {
    if (!this.handler) {
      return undefined;
    }

    const options: any = {
      ...this._tsComponentOptions,
      getParentRoute: () => parent,
    };
    if (this.instance.model.path) {
      options.path = this.instance.model.path;
    } else {
      options.id = this.instance.model.id;
    }
    const route = createRoute(options) as unknown as Route;

    const children: Route[] = [];
    for (const child of this.children) {
      const childRoute = child.createTsRoute(route);
      if (childRoute) {
        children.push(childRoute);
      }
    }
    route.addChildren(children);

    return route;
  }
}
