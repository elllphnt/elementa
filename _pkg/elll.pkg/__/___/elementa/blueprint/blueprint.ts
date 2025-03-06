import {
  combineLatestOrEmpty,
  Datafiable,
  Disposable,
  restoreReactiveMap,
} from "@repo/utils";
import { BehaviorSubject, map, switchMap } from "rxjs";
import { BlueprintData, ComponentData, ViewData } from "./_types";
import { Board } from "./board";
import { Component } from "./component";
import { View } from "./view";

export class Blueprint extends Disposable implements Datafiable<BlueprintData> {
  readonly board = new Board();

  private _views$ = new BehaviorSubject<Record<string, View>>({});
  private _components$ = new BehaviorSubject<Record<string, Component>>({});

  get views$() {
    return this._views$.pipe(map((views) => Object.values(views)));
  }
  get views() {
    return Object.values(this._views$.value);
  }

  view(id: string) {
    return this._views$.value[id] as View | undefined;
  }
  view$(id: string) {
    return this._views$.pipe(map((views) => views[id] as View | undefined));
  }

  get components$() {
    return this._components$.pipe(
      map((components) => Object.values(components)),
    );
  }
  get components() {
    return Object.values(this._components$.value);
  }

  component(id: string) {
    return this._components$.value[id] as Component | undefined;
  }
  component$(id: string) {
    return this._components$.pipe(
      map((components) => components[id] as Component | undefined),
    );
  }

  get data(): BlueprintData {
    return {
      views: this.views.map((view) => view.data),
      components: this.components.map((component) => component.data),
      board: this.board.data,
    };
  }
  get data$() {
    return combineLatestOrEmpty([
      this.views$.pipe(
        switchMap((views) =>
          combineLatestOrEmpty(views.map((view) => view.data$)),
        ),
      ),
      this.components$.pipe(
        switchMap((components) =>
          combineLatestOrEmpty(components.map((component) => component.data$)),
        ),
      ),
      this.board.data$,
    ]).pipe(
      map(([views, components, board]) => ({
        views,
        components,
        board,
      })),
    );
  }

  constructor() {
    super();

    this.addDisposer(() => {
      this._views$.complete();

      this.views.forEach((view) => view.dispose());
    });
  }

  addView(view: View) {
    this._views$.next({
      ...this._views$.value,
      [view.id]: view,
    });
  }
  removeView(view: View) {
    const views = { ...this._views$.value };
    delete views[view.id];
    this._views$.next(views);
  }

  addComponent(component: Component) {
    this._components$.next({
      ...this._components$.value,
      [component.id]: component,
    });
  }
  removeComponent(component: Component) {
    const components = { ...this._components$.value };
    delete components[component.id];
    this._components$.next(components);
  }

  restore(data: BlueprintData): void {
    restoreReactiveMap<View, ViewData>({
      datafiable$: this._views$,
      data: Object.fromEntries(
        data.views?.map((viewData) => [viewData.id, viewData]) ?? [],
      ),
      create: (viewData) => new View({ id: viewData.id }),
      restore: (view, viewData) => view.restore(viewData),
      dispose: (view) => view.dispose(),
    });
    restoreReactiveMap<Component, ComponentData>({
      datafiable$: this._components$,
      data: Object.fromEntries(
        data.components?.map((componentData) => [
          componentData.id,
          componentData,
        ]) ?? [],
      ),
      create: (componentData) => new Component({ id: componentData.id }),
      restore: (component, componentData) => component.restore(componentData),
      dispose: (component) => component.dispose(),
    });
    this.board.restore(data.board ?? {});
  }
}
