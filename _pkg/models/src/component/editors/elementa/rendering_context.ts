import {
  RenderingContextData,
  StyleModifierData,
} from "@elllphnt/elementa-base";
import { attachReactiveMap, Extendable } from "@elllphnt/elementa-utils";
import {
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import * as y from "yjs";
import { Component } from "../../component";
import { ColorThemeModel, withColorThemeBehavior } from "./color_theme";
import { ViewportModel, withViewportBehavior } from "./viewport";

export type RenderingContextModel = ReturnType<
  typeof attachReactiveMap<RenderingContextData>
> & {
  component: Component;
  theme: ColorThemeModel;
  viewport: ViewportModel;

  props: Record<string, any>;
  props$: Observable<Record<string, any>>;

  viewportEnabled: boolean;
  viewportEnabled$: Observable<boolean>;

  styleModifierEnabled: boolean;
  styleModifierEnabled$: Observable<boolean>;

  customStyleModifiers: StyleModifierData[];
  customStyleModifiers$: Observable<StyleModifierData[]>;

  styleModifiers: StyleModifierData[];
  styleModifiers$: Observable<StyleModifierData[]>;

  setProp(varName: string, value: any): void;
  clearProp(varName: string): void;
  setCustomStyleModifiers(styleModifiers: StyleModifierData[]): void;
  enableStyleModifier(): void;
  disableStyleModifier(): void;
  enableViewport(): void;
  disableViewport(): void;
};

/**
 * Attach RenderingContext behavior to a y.Map
 */
export function withRenderingContextBehavior(
  ymap: y.Map<any>,
  component: Component
): RenderingContextModel {
  const context = attachReactiveMap<RenderingContextData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<RenderingContextModel>;

  context.component = component;
  context.theme = withColorThemeBehavior(context.getOrCreateMap("theme"));
  context.viewport = withViewportBehavior(context.getOrCreateMap("viewport"));

  // Properties
  Object.defineProperty(context, "props", {
    get() {
      return context.value.props;
    },
    set(value) {
      context.set("props", value);
    },
  });
  context.props$ = context.observable$.pipe(
    map((value) => value.props),
    distinctUntilChanged()
  );

  // Viewport enabled
  Object.defineProperty(context, "viewportEnabled", {
    get() {
      return context.value.viewportEnabled ?? false;
    },
    set(value) {
      context.set("viewportEnabled", value);
    },
  });
  context.viewportEnabled$ = context.observable$.pipe(
    map((value) => value.viewportEnabled ?? false),
    distinctUntilChanged()
  );

  // Style modifier enabled
  Object.defineProperty(context, "styleModifierEnabled", {
    get() {
      return context.value.styleModifierEnabled ?? false;
    },
    set(value) {
      context.set("styleModifierEnabled", value);
    },
  });
  context.styleModifierEnabled$ = context.observable$.pipe(
    map((value) => value.styleModifierEnabled ?? false),
    distinctUntilChanged()
  );

  // Custom style modifiers
  Object.defineProperty(context, "customStyleModifiers", {
    get() {
      return context.value.styleModifiers ?? [];
    },
    set(value) {
      context.set("styleModifiers", value);
    },
  });
  context.customStyleModifiers$ = context.observable$.pipe(
    map((value) => value.styleModifiers ?? []),
    distinctUntilChanged()
  );

  // Computed modifiers
  const _themeStyleModifiers$ = context.theme.scheme$.pipe(
    switchMap((colorScheme) =>
      colorScheme
        ? context.component.project.styleManager.colorSchemeModifiers$({
            colorScheme,
          })
        : of([])
    )
  );

  const _viewportStyleModifiers$ = combineLatest([
    context.viewport.height$,
    context.viewport.width$,
  ]).pipe(
    switchMap(([height, width]) => {
      return context.component.project.styleManager.viewportModifiers$({
        height,
        width,
      });
    })
  );

  const _styleModifiers$ = combineLatest([
    _themeStyleModifiers$,
    _viewportStyleModifiers$,
    context.customStyleModifiers$,
  ]).pipe(
    map(([themeMods, viewportMods, customMods]) => [
      ...viewportMods,
      ...themeMods,
      ...customMods,
    ])
  );

  // Final exposed styleModifiers
  Object.defineProperty(context, "styleModifiers", {
    get() {
      if (!context.styleModifierEnabled) return [];
      return [
        ...context.component.project.styleManager.viewportModifiers({
          width: context.viewport.width,
          height: context.viewport.height,
        }),
        ...context.component.project.styleManager.colorSchemeModifiers({
          colorScheme: context.theme.scheme,
        }),
        ...(context.customStyleModifiers ?? []),
      ];
    },
  });
  context.styleModifiers$ = context.styleModifierEnabled$.pipe(
    switchMap((enabled) => (enabled ? _styleModifiers$ : of([])))
  );

  // Methods
  context.setProp = (varName: string, value: any) => {
    context.set("props", {
      ...context.props,
      [varName]: value,
    });
  };

  context.clearProp = (varName: string) => {
    const newProps = { ...context.props };
    delete newProps[varName];
    context.set("props", newProps);
  };

  context.setCustomStyleModifiers = (styleModifiers: StyleModifierData[]) => {
    context.set("styleModifiers", styleModifiers);
  };

  context.enableStyleModifier = () => {
    context.set("styleModifierEnabled", true);
  };

  context.disableStyleModifier = () => {
    context.set("styleModifierEnabled", false);
  };

  context.enableViewport = () => {
    context.set("viewportEnabled", true);
  };

  context.disableViewport = () => {
    context.set("viewportEnabled", false);
  };

  return context as RenderingContextModel;
}

/**
 * Create a new local RenderingContext
 */
export function createRenderingContextModel(
  component: Component
): RenderingContextModel {
  const ymap = new y.Map<any>();
  return withRenderingContextBehavior(ymap, component);
}
