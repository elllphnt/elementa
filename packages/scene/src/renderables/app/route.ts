import { RouteTreeInstance } from "@elllphnt/elementa-runtime";
import { reconcileList } from "@elllphnt/elementa-utils";
import { createRoute, RootRoute, Route } from "@tanstack/react-router";
import { createElement } from "react";
import { BehaviorSubject } from "rxjs";
import ComponentComponent from "../../components/component/component.js";
import { Scene } from "../../scene/scene.js";
import { ComponentRenderable } from "../component/component.js";
import { Renderable } from "../renderable.js";

export class RouteTreeRenderable extends Renderable {
  readonly instance: RouteTreeInstance;

  private _onStructure: () => void;
  private _children$ = new BehaviorSubject<RouteTreeRenderable[]>([]);
  private _mainView$ = new BehaviorSubject<ComponentRenderable | undefined>(
    undefined
  );

  private _tsRoute: Route | undefined;

  get children$() {
    return this._children$.asObservable();
  }
  get children() {
    return this._children$.value;
  }

  get mainView$() {
    return this._mainView$.asObservable();
  }
  get mainView() {
    return this._mainView$.value;
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

    const mainViewSubscription = this.instance.mainView$.subscribe((view) => {
      const currentView = this._mainView$.value;
      if (view) {
        this._mainView$.next(
          new ComponentRenderable({
            scene,
            instance: view,
          })
        );
      } else {
        this._mainView$.next(undefined);
      }
      if (currentView) {
        currentView.dispose();
      }
    });

    this.addDisposer(() => {
      this._children$.complete();
      this._mainView$.complete();

      childrenSubscription.unsubscribe();
      mainViewSubscription.unsubscribe();
    });
  }

  createTsRoute(parent: RootRoute | Route): Route {
    const options: any = {
      getParentRoute: () => parent,
      component: () =>
        this.mainView
          ? createElement(ComponentComponent, {
              component: this.mainView,
            })
          : undefined,
    };
    if (this.instance.model.path) {
      options.path = this.instance.model.path;
    } else {
      options.id = this.instance.model.id;
    }
    const route = createRoute(options) as unknown as Route;

    const children = this.children.map((child) => child.createTsRoute(route));
    route.addChildren(children);

    this._tsRoute = route;
    return route;
  }
}
