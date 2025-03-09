import { CssSelector, StyleModifierData } from "@elllphnt/elll-element";
import { Observable } from "rxjs";

export abstract class StyleManager {
  abstract cssSelectorOf({
    layer,
    modifiers,
    baseSelector,
  }: {
    layer?: string;
    modifiers?: StyleModifierData[];
    baseSelector: string;
  }): CssSelector;
  abstract cssSelectorOf$({
    layer,
    modifiers,
    baseSelector,
  }: {
    layer?: string;
    modifiers?: StyleModifierData[];
    baseSelector: string;
  }): Observable<CssSelector>;

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
    modifier: StyleModifierData,
  ): Observable<string>;

  abstract modifiersToElllSelector(modifiers: StyleModifierData[]): string;
  abstract modifiersToElllSelector$(
    modifiers: StyleModifierData[],
  ): Observable<string>;

  abstract modifiersFromElllSelector(selector: string): StyleModifierData[];
  abstract modifiersFromElllSelector$(
    selector: string,
  ): Observable<StyleModifierData[]>;
}
