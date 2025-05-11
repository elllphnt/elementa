import { StyleModifierData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Component } from "../../component.js";
import { ColorTheme } from "./color_theme.js";
import { Viewport } from "./viewport.js";

export interface RenderingContext {
  component: Component;
  theme: ColorTheme;
  viewport: Viewport;

  viewportEnabled: boolean;
  viewportEnabled$: Observable<boolean>;

  styleModifierEnabled: boolean;
  styleModifierEnabled$: Observable<boolean>;

  customStyleModifiers: StyleModifierData[];
  customStyleModifiers$: Observable<StyleModifierData[]>;

  styleModifiers: StyleModifierData[];
  styleModifiers$: Observable<StyleModifierData[]>;
}
