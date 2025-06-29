import { StyleModifierData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { ColorTheme } from "./color_theme.js";
import { Viewport } from "./viewport.js";

export interface RenderingContext {
  theme: ColorTheme;
  viewport: Viewport;

  viewportEnabled: boolean | undefined;
  viewportEnabled$: Observable<boolean | undefined>;

  styleModifierEnabled: boolean | undefined;
  styleModifierEnabled$: Observable<boolean | undefined>;

  customStyleModifiers: StyleModifierData[];
  customStyleModifiers$: Observable<StyleModifierData[]>;

  styleModifiers: StyleModifierData[];
  styleModifiers$: Observable<StyleModifierData[]>;
}
