import { Component, FileModelAdaptor } from "@elllphnt/elementa-models";
import {
  ComponentInstance,
  ModelInstanceAdaptor,
  PageRouteHandler,
} from "@elllphnt/elementa-runtime";
import { BehaviorSubject } from "rxjs";
import { Scene } from "../../scene/scene.js";
import { InstanceRenderableAdaptor } from "../adaptors/instance.js";
import { ComponentRenderable } from "../component/component.js";
import { InstanceRenderable } from "../instance.js";

export class RouteHandlerRenderable extends InstanceRenderable<PageRouteHandler> {
  private _children$ = new BehaviorSubject<RouteHandlerRenderable[]>([]);
  private _mainView$ = new BehaviorSubject<
    | InstanceRenderableAdaptor<
        ComponentInstance,
        ComponentRenderable,
        ModelInstanceAdaptor<
          Component,
          ComponentInstance,
          FileModelAdaptor<"component">
        >
      >
    | undefined
  >(undefined);
  private _errorView$ = new BehaviorSubject<
    | InstanceRenderableAdaptor<
        ComponentInstance,
        ComponentRenderable,
        ModelInstanceAdaptor<
          Component,
          ComponentInstance,
          FileModelAdaptor<"component">
        >
      >
    | undefined
  >(undefined);
  private _pendingView$ = new BehaviorSubject<
    | InstanceRenderableAdaptor<
        ComponentInstance,
        ComponentRenderable,
        ModelInstanceAdaptor<
          Component,
          ComponentInstance,
          FileModelAdaptor<"component">
        >
      >
    | undefined
  >(undefined);
  private _notFoundView$ = new BehaviorSubject<
    | InstanceRenderableAdaptor<
        ComponentInstance,
        ComponentRenderable,
        ModelInstanceAdaptor<
          Component,
          ComponentInstance,
          FileModelAdaptor<"component">
        >
      >
    | undefined
  >(undefined);

  get mainView() {
    return this._mainView$.value;
  }
  get mainView$() {
    return this._mainView$.asObservable();
  }

  get errorView() {
    return this._errorView$.value;
  }
  get errorView$() {
    return this._errorView$.asObservable();
  }

  get pendingView() {
    return this._pendingView$.value;
  }
  get pendingView$() {
    return this._pendingView$.asObservable();
  }

  get notFoundView() {
    return this._notFoundView$.value;
  }
  get notFoundView$() {
    return this._notFoundView$.asObservable();
  }

  get children$() {
    return this._children$.asObservable();
  }
  get children() {
    return this._children$.value;
  }

  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: PageRouteHandler;
  }) {
    super({ scene, instance });

    const mainViewSubscription = this.instance.mainView$.subscribe(
      (instanceAdaptor) => {
        const current = this.mainView;
        if (instanceAdaptor) {
          const next = new InstanceRenderableAdaptor<
            ComponentInstance,
            ComponentRenderable,
            ModelInstanceAdaptor<
              Component,
              ComponentInstance,
              FileModelAdaptor<"component">
            >
          >({
            instanceAdaptor,
            create: (instance) => new ComponentRenderable({ scene, instance }),
          });
          this._mainView$.next(next);
        } else {
          this._mainView$.next(undefined);
        }
        current?.dispose();
      }
    );

    const errorViewSubscription = this.instance.errorView$.subscribe(
      (instanceAdaptor) => {
        const current = this.errorView;
        if (instanceAdaptor) {
          const next = new InstanceRenderableAdaptor<
            ComponentInstance,
            ComponentRenderable,
            ModelInstanceAdaptor<
              Component,
              ComponentInstance,
              FileModelAdaptor<"component">
            >
          >({
            instanceAdaptor,
            create: (instance) => new ComponentRenderable({ scene, instance }),
          });
          this._errorView$.next(next);
        } else {
          this._errorView$.next(undefined);
        }
        current?.dispose();
      }
    );

    const pendingViewSubscription = this.instance.pendingView$.subscribe(
      (instanceAdaptor) => {
        const current = this.pendingView;
        if (instanceAdaptor) {
          const next = new InstanceRenderableAdaptor<
            ComponentInstance,
            ComponentRenderable,
            ModelInstanceAdaptor<
              Component,
              ComponentInstance,
              FileModelAdaptor<"component">
            >
          >({
            instanceAdaptor,
            create: (instance) => new ComponentRenderable({ scene, instance }),
          });
          this._pendingView$.next(next);
        } else {
          this._pendingView$.next(undefined);
        }
        current?.dispose();
      }
    );

    const notFoundViewSubscription = this.instance.notFoundView$.subscribe(
      (instanceAdaptor) => {
        const current = this.notFoundView;
        if (instanceAdaptor) {
          const next = new InstanceRenderableAdaptor<
            ComponentInstance,
            ComponentRenderable,
            ModelInstanceAdaptor<
              Component,
              ComponentInstance,
              FileModelAdaptor<"component">
            >
          >({
            instanceAdaptor,
            create: (instance) => new ComponentRenderable({ scene, instance }),
          });
          this._notFoundView$.next(next);
        } else {
          this._notFoundView$.next(undefined);
        }
        current?.dispose();
      }
    );

    this.addDisposer(() => {
      this._children$.complete();
      this._mainView$.complete();
      this._errorView$.complete();
      this._pendingView$.complete();
      this._notFoundView$.complete();

      mainViewSubscription.unsubscribe();
      errorViewSubscription.unsubscribe();
      pendingViewSubscription.unsubscribe();
      notFoundViewSubscription.unsubscribe();
    });
  }
}
