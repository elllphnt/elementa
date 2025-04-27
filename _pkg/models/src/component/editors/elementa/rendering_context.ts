import {
  RenderingContextData,
  StyleModifierData,
} from "@elllphnt/elementa-base";
import { MapCRDTModel } from "@elllphnt/elementa-utils";
import {
  Observable,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from "rxjs";
import * as y from "yjs";
import { Component } from "../../component";
import { ColorTheme } from "./color_theme";
import { Viewport } from "./viewport";

export class RenderingContext extends MapCRDTModel<RenderingContextData> {
  readonly component: Component;
  readonly theme: ColorTheme;
  readonly viewport: Viewport;

  get props() {
    return this.state.props;
  }
  get props$() {
    return this.state$.pipe(
      map((state) => state.props),
      distinctUntilChanged()
    );
  }

  prop(key: string) {
    return this.props[key];
  }
  prop$(key: string) {
    return this.props$.pipe(
      map((props) => props[key]),
      distinctUntilChanged()
    );
  }

  get themeStyleModifiers() {
    return this.theme.scheme
      ? this.component.project.styleManager.colorSchemeModifiers({
          colorScheme: this.theme.scheme,
        })
      : [];
  }
  get themeStyleModifiers$() {
    return this.theme.scheme$.pipe(
      switchMap((colorScheme) =>
        colorScheme
          ? this.component.project.styleManager.colorSchemeModifiers$({
              colorScheme,
            })
          : of([])
      )
    );
  }

  get viewportStyleModifiers() {
    return this.viewport
      ? this.component.project.styleManager.viewportModifiers({
          height: this.viewport.height,
          width: this.viewport.width,
        })
      : [];
  }
  get viewportStyleModifiers$() {
    return combineLatest([this.viewport.height$, this.viewport.width$]).pipe(
      switchMap(([height, width]) => {
        return this.component.project.styleManager.viewportModifiers$({
          height,
          width,
        });
      })
    );
  }

  get viewportEnabled() {
    return this.state.viewportEnabled ?? false;
  }
  get viewportEnabled$() {
    return this.state$.pipe(
      map((state) => state.viewportEnabled ?? false),
      distinctUntilChanged()
    );
  }

  get customStyleModifiers() {
    return this.state.styleModifiers ?? [];
  }
  get customStyleModifiers$() {
    return this.state$.pipe(
      map((state) => state.styleModifiers ?? []),
      distinctUntilChanged()
    );
  }

  get styleModifierEnabled() {
    return this.styleModifierEnabled;
  }
  get styleModifierEnabled$() {
    return this.state$.pipe(
      map((state) => state.styleModifierEnabled),
      distinctUntilChanged()
    );
  }

  private get _styleModifiers(): StyleModifierData[] {
    return [
      ...this.viewportStyleModifiers,
      ...this.themeStyleModifiers,
      ...this.customStyleModifiers,
    ];
  }
  private get _styleModifers$(): Observable<StyleModifierData[]> {
    return combineLatest([
      this.themeStyleModifiers$,
      this.viewportStyleModifiers$,
      this.customStyleModifiers$,
    ]).pipe(
      map(([colorSchemeModifiers, themeModifiers, customModifiers]) => {
        return [...colorSchemeModifiers, ...themeModifiers, ...customModifiers];
      })
    );
  }

  get styleModifiers() {
    return this.styleModifierEnabled ? this._styleModifiers : [];
  }
  get styleModifiers$() {
    return this.styleModifierEnabled$.pipe(
      switchMap((enabled) => {
        return enabled ? this._styleModifers$ : of([]);
      })
    );
  }

  constructor(ymap: y.Map<any>, component: Component) {
    super(ymap);
    this.component = component;

    this.theme = new ColorTheme(this.getOrCreateMap("theme"));
    this.viewport = new Viewport(this.getOrCreateMap("viewport"));

    this.addDisposer(() => {
      this.viewport.dispose();
      this.theme.dispose();
    });
  }

  setProp(varName: string, value: any) {
    const newProps = {
      ...this.props,
    };

    newProps[varName] = value;
    this.patch({
      props: newProps,
    });
  }
  clearProp(varName: string) {
    const newProps = {
      ...this.props,
    };

    delete newProps[varName];
    this.patch({
      props: newProps,
    });
  }

  setCustomStyleModifiers(styleModifiers: StyleModifierData[]): void {
    this.patch({
      styleModifiers: styleModifiers,
    });
  }

  enableStyleModifier(): void {
    this.patch({
      styleModifierEnabled: true,
    });
  }
  disableStyleModifier(): void {
    this.patch({
      styleModifierEnabled: false,
    });
  }

  enableViewport(): void {
    this.patch({
      viewportEnabled: true,
    });
  }
  disableViewport(): void {
    this.patch({
      viewportEnabled: false,
    });
  }
}
