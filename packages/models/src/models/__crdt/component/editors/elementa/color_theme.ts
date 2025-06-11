import { ColorThemeData } from "@elllphnt/elementa-base";
import {
  assert,
  attachReactiveMap,
  setEnhancer,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { ColorTheme } from "../../../../../_.js";

export function attachColorTheme(
  theme: y.Map<any>
): theme is y.Map<any> & ColorTheme {
  assert(attachReactiveMap<ColorThemeData>(theme));
  assert(setReactiveMapGetters(theme, ["scheme", "foreground", "background"]));

  return setEnhancer<ColorTheme>(theme, attachColorTheme);
}
