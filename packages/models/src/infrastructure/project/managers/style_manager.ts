import {
  CssSelector,
  ElllSelectorData,
  StyleDataData,
  StyleModifierData,
  VarRef,
} from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { CssStyleSheet } from "../../../css/_.js";

export abstract class StyleManager {
  abstract get stylesheets(): CssStyleSheet[];
  abstract get stylesheets$(): Observable<CssStyleSheet[]>;

  abstract cssSelectorOf(selector: ElllSelectorData): CssSelector;
  abstract cssSelectorOf$(selector: ElllSelectorData): Observable<CssSelector>;

  abstract varRefValue(varRef: VarRef): StyleDataData;
  abstract varRefValue$(varRef: VarRef): Observable<StyleDataData>;

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
