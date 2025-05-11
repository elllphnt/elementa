import { ColorData, ColorThemeData } from "@elllphnt/elementa-base";
import {
  ReactiveMap,
  assert,
  attachReactiveMap,
  setEnhancer,
  setReactiveMapGetters,
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

export function attachColorTheme(ymap: y.Map<any>): ymap is ColorTheme {
  assert(
    attachReactiveMap<ColorThemeData>(ymap as y.Map<any>),
    "Failed to attach reactive map to ymap"
  );
  const theme = ymap as ColorTheme;

  setReactiveMapGetters(theme, ["scheme", "foreground", "background"]);

  setEnhancer(theme, attachColorTheme);
  return true;
}

export function createColorTheme(): ColorTheme {
  const ymap = new y.Map<any>();
  assert(attachColorTheme(ymap), "Failed to attach reactive map to ymap");
  return ymap;
}
