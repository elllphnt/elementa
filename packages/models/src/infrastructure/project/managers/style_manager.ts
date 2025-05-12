import {
  CssSelector,
  ElllSelectorData,
  StyleModifierData,
} from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { CssStyleSheet } from "../../../css/_.js";

export abstract class StyleManager {
  abstract rootStylesheet: Stylesheet;
  abstract rootCssStylesheet: CssStyleSheet;

  abstract get stylesheets(): CssStyleSheet[];
  abstract get stylesheets$(): Observable<CssStyleSheet[]>;

  abstract cssSelectorOf(selector: ElllSelectorData): CssSelector;
  abstract cssSelectorOf$(selector: ElllSelectorData): Observable<CssSelector>;

  abstract variableValue(name: string): any;
  abstract variableValue$(name: string): Observable<any>;

  abstract colorSchemeModifiers({
    colorScheme,
  }: {
    colorScheme: string;
  }): StyleModifierData[];
  abstract colorSchemeModifiers$({
    colorScheme,
  }: {
    colorScheme: string;
  }): Observable<StyleModifierData[]>;

  abstract viewportModifiers({
    height,
    width,
  }: {
    height?: number;
    width?: number;
  }): StyleModifierData[];
  abstract viewportModifiers$({
    height,
    width,
  }: {
    height?: number;
    width?: number;
  }): Observable<StyleModifierData[]>;

  abstract modifierToString(modifier: StyleModifierData): string;
  abstract modifierToString$(modifier: StyleModifierData): Observable<string>;

  abstract modifierToClassName(modifier: StyleModifierData): string;
  abstract modifierToClassName$(
    modifier: StyleModifierData
  ): Observable<string>;

  abstract stringifyElllSelector(modifiers: StyleModifierData[]): string;
  abstract stringifyElllSelector$(
    modifiers: StyleModifierData[]
  ): Observable<string>;

  abstract parseElllSelector(selector: string): StyleModifierData[];
  abstract parseElllSelector$(
    selector: string
  ): Observable<StyleModifierData[]>;
}
