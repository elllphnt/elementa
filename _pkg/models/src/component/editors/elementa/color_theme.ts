import { ColorData, ColorThemeData } from "@elllphnt/elementa-base";
import {
  ReactiveMap,
  attachReactiveMap,
  setEnhancer,
  setModelFields,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";

export type ColorTheme = ReactiveMap<ColorThemeData> & {
  scheme: string;
  scheme$: Observable<string>;

  foreground: ColorData;
  foreground$: Observable<ColorData>;

  background: ColorData;
  background$: Observable<ColorData>;
};

export function attachColorTheme(ymap: y.Map<any>): ColorTheme {
  const theme = attachReactiveMap<ColorThemeData>(
    ymap as y.Map<any>
  ) as ColorTheme;

  setModelFields(theme, ["scheme", "foreground", "background"]);

  setEnhancer(theme, attachColorTheme);
  return theme;
}

export function createColorTheme(): ColorTheme {
  const ymap = new y.Map<any>();
  return attachColorTheme(ymap);
}
