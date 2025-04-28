import { ColorData, ColorThemeData } from "@elllphnt/elementa-base";
import { Extendable, attachReactiveMap } from "@elllphnt/elementa-utils";
import { Observable, map } from "rxjs";
import * as y from "yjs";

export type ColorThemeModel = ReturnType<
  typeof attachReactiveMap<ColorThemeData>
> & {
  scheme: string;
  scheme$: Observable<string>;

  foreground: ColorData;
  foreground$: Observable<ColorData>;

  background: ColorData;
  background$: Observable<ColorData>;
};

/**
 * Attach ColorTheme behavior to a y.Map
 */
export function withColorThemeBehavior(ymap: y.Map<any>): ColorThemeModel {
  const theme = attachReactiveMap<ColorThemeData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<ColorThemeModel>;

  // Fields
  const fields = ["scheme", "foreground", "background"] as const;

  for (const field of fields) {
    Object.defineProperty(theme, field, {
      get() {
        return theme.value[field];
      },
      set(value) {
        theme.set(field, value);
      },
    });

    (theme as any)[`${field}$`] = theme.observable$.pipe(
      map((value) => value[field])
    );
  }

  return theme as ColorThemeModel;
}

/**
 * Create a new local ColorTheme model
 */
export function createColorThemeModel(): ColorThemeModel {
  const ymap = new y.Map<any>();
  return withColorThemeBehavior(ymap);
}
