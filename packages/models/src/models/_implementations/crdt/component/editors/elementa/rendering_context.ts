import { RenderingContextData } from "@elllphnt/elementa-base";
import {
  assert,
  attachReactiveMap,
  getOrCreateYMap,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import { combineLatest, distinctUntilChanged, map, of, switchMap } from "rxjs";
import * as y from "yjs";
import { Project } from "../../../../../../infrastructure/_.js";
import { ColorTheme, RenderingContext, Viewport } from "../../../../../_.js";
import { attachColorTheme } from "./color_theme.js";
import { attachViewport } from "./viewport.js";

export function attachRenderingContext(
  context: y.Map<any>,
  project: Project
): context is y.Map<any> & RenderingContext {
  assert(attachReactiveMap<RenderingContextData>(context));
  assert(
    setReactiveMapGetters(context, [
      "viewportEnabled",
      "styleModifierEnabled",
      "styleModifiers",
    ])
  );

  // Set direct references
  const theme = getOrCreateYMap(context, "theme");
  assert(attachColorTheme(theme));
  assert(setObjectProperty(context, "theme", theme as ColorTheme));

  const viewport = getOrCreateYMap(context, "viewport");
  assert(attachViewport(viewport));
  assert(setObjectProperty(context, "viewport", viewport as Viewport));

  // Custom style modifiers
  assert(
    setObjectGetter(
      context,
      "customStyleModifiers",
      () => context.get("styleModifiers") ?? []
    )
  );
  assert(
    setObjectProperty(
      context,
      "customStyleModifiers$",
      context.items$.pipe(
        map((value) => value.styleModifiers ?? []),
        distinctUntilChanged()
      )
    )
  );

  // Computed streams
  const _themeStyleModifiers$ = context.theme.scheme$.pipe(
    switchMap((colorScheme) =>
      colorScheme
        ? project.styleManager.colorSchemeModifiers$({ colorScheme })
        : of([])
    )
  );

  const _viewportStyleModifiers$ = combineLatest([
    context.viewport.height$,
    context.viewport.width$,
  ]).pipe(
    switchMap(([height, width]) =>
      project.styleManager.viewportModifiers$({ height, width })
    )
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

  assert(
    setObjectGetter(context, "styleModifiers", () => {
      if (!context.styleModifierEnabled) return [];
      return [
        ...project.styleManager.viewportModifiers({
          width: context.viewport.width,
          height: context.viewport.height,
        }),
        ...(context.theme.scheme
          ? project.styleManager.colorSchemeModifiers({
              colorScheme: context.theme.scheme,
            })
          : []),
        ...(context.customStyleModifiers ?? []),
      ];
    })
  );

  assert(
    setObjectProperty(
      context,
      "styleModifiers$",
      context.styleModifierEnabled$.pipe(
        switchMap((enabled) => (enabled ? _styleModifiers$ : of([])))
      )
    )
  );

  return setEnhancer<RenderingContext>(context, attachRenderingContext);
}
