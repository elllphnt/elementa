import {
  RenderingContextData,
  StyleModifierData,
} from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  Extendable,
  ReactiveMap,
  setEnhancer,
  setModelFields,
} from "@elllphnt/elementa-utils";
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
import { attachColorTheme, ColorTheme } from "./color_theme";
import { attachViewport, Viewport } from "./viewport";

export type RenderingContext = ReactiveMap<RenderingContextData> & {
  component: Component;
  theme: ColorTheme;
  viewport: Viewport;

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
};

/**
 * Attach RenderingContext behavior to a y.Map
 */
export function attachRenderingContext(
  ymap: y.Map<any>,
  component: Component
): RenderingContext {
  const context = attachReactiveMap<RenderingContextData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<RenderingContext>;

  context.component = component;
  context.theme = attachColorTheme(context.getOrCreateMap("theme"));
  context.viewport = attachViewport(context.getOrCreateMap("viewport"));

  setModelFields(context, [
    "props",
    "viewportEnabled",
    "styleModifierEnabled",
    "styleModifiers",
  ]);

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

  setEnhancer(context, attachRenderingContext);
  return context as RenderingContext;
}

/**
 * Create a new local RenderingContext
 */
export function createRenderingContext(component: Component): RenderingContext {
  const ymap = new y.Map<any>();
  return attachRenderingContext(ymap, component);
}
