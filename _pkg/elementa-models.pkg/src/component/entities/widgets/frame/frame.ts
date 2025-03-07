import {
  ColorData,
  CornerData,
  CornerName,
  Expression,
  FrameWidgetData,
  OverflowValue,
  StyleModifierData,
  entityTypes,
} from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from "rxjs";
import { Component } from "../../../component";
import { Fragment } from "../../fragment";
import { Widget } from "../widget";
import { FrameViewport } from "./viewport";

export class FrameWidget extends Widget<FrameWidgetData> {
  private _fragmentId$ = new BehaviorSubject<string | undefined>(undefined);
  private _base$ = new BehaviorSubject<boolean | undefined>(undefined);
  private _corners$ = new BehaviorSubject<CornerData<number> | undefined>(
    undefined,
  );
  private _props$ = new BehaviorSubject<Record<string, Expression>>({});
  private _height$ = new BehaviorSubject<number | undefined>(undefined);
  private _width$ = new BehaviorSubject<number | undefined>(undefined);
  private _backgroundColor$ = new BehaviorSubject<ColorData | undefined>(
    undefined,
  );
  private _foregroundColor$ = new BehaviorSubject<ColorData | undefined>(
    undefined,
  );
  private _viewport$ = new BehaviorSubject<FrameViewport | undefined>(
    undefined,
  );
  private _colorScheme$ = new BehaviorSubject<string | undefined>(undefined);

  get fragmentId() {
    return this._fragmentId$.value;
  }
  get fragmentId$() {
    return this._fragmentId$.asObservable();
  }

  get fragment() {
    return this.fragmentId
      ? this.component.entityOfType<Fragment>(
          this.fragmentId,
          entityTypes.fragment,
        )
      : this.component.template;
  }
  get fragment$() {
    return this.fragmentId$.pipe(
      switchMap((fragmentId) => {
        return fragmentId
          ? this.component.entityOfType$<Fragment>(
              fragmentId,
              entityTypes.fragment,
            )
          : of(this.component.template);
      }),
    );
  }

  get colorScheme() {
    return this._colorScheme$.value;
  }
  get colorScheme$() {
    return this._colorScheme$.asObservable();
  }

  get backgroundColor() {
    return this._backgroundColor$.value;
  }
  get backgroundColor$() {
    return this._backgroundColor$.asObservable();
  }

  get foregroundColor() {
    return this._foregroundColor$.value;
  }
  get foregroundColor$() {
    return this._foregroundColor$.asObservable();
  }

  get base() {
    return this._base$.value;
  }
  get base$() {
    return this._base$.asObservable();
  }

  get props() {
    return this._props$.value;
  }
  get props$() {
    return this._props$.asObservable();
  }

  prop(key: string) {
    return this._props$.value[key];
  }
  prop$(key: string) {
    return this._props$.asObservable().pipe(
      map((props) => props[key]),
      distinctUntilChanged(),
    );
  }

  get height() {
    return this._height$.value;
  }
  get height$() {
    return this._height$.pipe(distinctUntilChanged());
  }

  get width() {
    return this._width$.value;
  }
  get width$() {
    return this._width$.pipe(distinctUntilChanged());
  }

  get corners() {
    return this._corners$.value;
  }
  get corners$() {
    return this._corners$.asObservable();
  }

  corner<C extends CornerName>(name: C) {
    switch (name) {
      case "top-left":
        return this.corners?.topLeft;
      case "top-right":
        return this.corners?.topRight;
      case "bottom-left":
        return this.corners?.bottomLeft;
      case "bottom-right":
        return this.corners?.bottomRight;
    }
  }
  corner$<C extends CornerName>(name: C) {
    return this.corners$.pipe(
      map((corner) => {
        switch (name) {
          case "top-left":
            return corner?.topLeft;
          case "top-right":
            return corner?.topRight;
          case "bottom-left":
            return corner?.bottomLeft;
          case "bottom-right":
            return corner?.bottomRight;
        }
      }),
    );
  }

  get viewport() {
    return this._viewport$.value;
  }
  get viewport$() {
    return this._viewport$.asObservable();
  }

  get viewportHeight() {
    return this.viewport?.height;
  }
  get viewportHeight$() {
    return this.viewport$.pipe(
      switchMap((viewport) => viewport?.height$ ?? of(undefined)),
      distinctUntilChanged(),
    );
  }

  get viewportWidth() {
    return this.viewport?.width;
  }
  get viewportWidth$() {
    return this.viewport$.pipe(
      switchMap((viewport) => viewport?.width$ ?? of(undefined)),
      distinctUntilChanged(),
    );
  }

  get overflow() {
    return this.viewport?.overflow;
  }
  get overflow$() {
    return this.viewport$.pipe(
      switchMap((viewport) => viewport?.overflow$ ?? of(undefined)),
    );
  }

  get colorSchemeModifiers() {
    return this.colorScheme
      ? this.component.project.styleManager.colorSchemeModifiers({
          colorScheme: this.colorScheme,
        })
      : [];
  }
  get colorSchemeModifiers$() {
    return this.colorScheme$.pipe(
      switchMap((colorScheme) =>
        colorScheme
          ? this.component.project.styleManager.colorSchemeModifiers$({
              colorScheme,
            })
          : of([]),
      ),
    );
  }

  get viewportModifiers() {
    return this.viewport
      ? this.component.project.styleManager.viewportModifiers({
          height: this.viewport.height,
          width: this.viewport.width,
        })
      : [];
  }
  get viewportModifiers$() {
    return combineLatest([this.viewportHeight$, this.viewportWidth$]).pipe(
      switchMap(([height, width]) => {
        return this.component.project.styleManager.viewportModifiers$({
          height,
          width,
        });
      }),
    );
  }

  get styleModifiers(): StyleModifierData[] {
    return [...this.viewportModifiers, ...this.colorSchemeModifiers];
  }
  get styleModifers$(): Observable<StyleModifierData[]> {
    return combineLatest([
      this.colorSchemeModifiers$,
      this.viewportModifiers$,
    ]).pipe(
      map(([colorSchemeModifiers, viewportModifiers]) => {
        return [...viewportModifiers, ...colorSchemeModifiers];
      }),
    );
  }

  get data(): FrameWidgetData {
    return {
      ...super._data,
      base: this.base,
      props: this.props,
      height: this.height,
      width: this.width,
      corners: this.corners,
      backgroundColor: this.backgroundColor,
      foregroundColor: this.foregroundColor,
      viewport: this.viewport?.data,
      colorScheme: this.colorScheme,
      fragmentId: this.fragmentId,
    };
  }
  get data$(): Observable<FrameWidgetData> {
    return combineLatestOrEmpty([
      super._data$,
      this.base$,
      this.props$,
      this.height$,
      this.width$,
      this.corners$,
      this.backgroundColor$,
      this.foregroundColor$,
      this.viewport$.pipe(
        switchMap((viewport) => viewport?.data$ ?? of(undefined)),
      ),
      this.colorScheme$,
      this.fragmentId$,
    ]).pipe(
      map(
        ([
          data,
          base,
          props,
          height,
          width,
          corners,
          backgroundColor,
          foregroundColor,
          viewport,
          colorScheme,
          fragmentId,
        ]) => ({
          ...data,
          base,
          props,
          height,
          width,
          corners,
          backgroundColor,
          foregroundColor,
          viewport,
          colorScheme,
          fragmentId,
        }),
      ),
    );
  }

  constructor({ id, component }: { id?: string; component: Component }) {
    super({
      id,
      type: entityTypes.widgets.frame,
      component,
    });

    this.addDisposer(() => {
      this._props$.complete();
      this._corners$.complete();
      this._base$.complete();
      this._viewport$.complete();

      this.viewport?.dispose();
    });
  }

  setFragmentId(fragmentId: string | undefined) {
    this._fragmentId$.next(fragmentId);
  }

  setBase(base: boolean | undefined) {
    this._base$.next(base);
  }
  setOverflow(overflow: OverflowValue | undefined) {
    this.viewport?.update({ overflow });
  }
  setProp(id: string, value: Expression | undefined) {
    const newProps = {
      ...this._props$.value,
    };

    if (value === undefined) {
      delete newProps[id];
    } else {
      newProps[id] = value;
    }

    this._props$.next(newProps);
  }

  setViewport(viewport: FrameViewport | undefined) {
    this._viewport$.next(viewport);
  }
  setViewportHeight(viewportHeight: number | undefined) {
    this.viewport?.update({ height: viewportHeight });
  }
  setViewportWidth(viewportWidth: number | undefined) {
    this.viewport?.update({ width: viewportWidth });
  }

  setHeight(height: number | undefined) {
    this._height$.next(height !== undefined ? Math.round(height) : undefined);
  }
  setWidth(width: number | undefined) {
    this._width$.next(width !== undefined ? Math.round(width) : undefined);
  }
  setCorner(name: CornerName, value: number | undefined) {
    const newCorner = {
      ...this._corners$.value,
    };

    switch (name) {
      case "top-left":
        newCorner.topLeft = value;
        break;
      case "top-right":
        newCorner.topRight = value;
        break;
      case "bottom-left":
        newCorner.bottomLeft = value;
        break;
      case "bottom-right":
        newCorner.bottomRight = value;
        break;
    }

    this._corners$.next(newCorner);
  }
  setBackgroundColor(value: ColorData | undefined) {
    this._backgroundColor$.next(value);
  }
  setForegroundColor(value: ColorData | undefined) {
    this._foregroundColor$.next(value);
  }
  setColorScheme(value: string | undefined) {
    this._colorScheme$.next(value);
  }

  restore(data: FrameWidgetData) {
    super.restore(data);

    this._base$.next(data.base);
    this._props$.next(data.props ?? {});
    this._height$.next(data.height);
    this._width$.next(data.width);
    this._corners$.next(data.corners);
    this._backgroundColor$.next(data.backgroundColor);
    this._foregroundColor$.next(data.foregroundColor);
    this._colorScheme$.next(data.colorScheme);
    this._fragmentId$.next(data.fragmentId);

    if (data.viewport) {
      const viewport =
        this.viewport ?? new FrameViewport({ component: this.component });
      viewport.restore(data.viewport);
      this._viewport$.next(viewport);
    } else {
      this._viewport$.next(undefined);
    }
  }
}
