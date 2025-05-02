import {
  CssSelector,
  ElllSelectorData,
  StyleModifierData,
} from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { CssStyleSheet } from "../../css/_";
import { Stylesheet } from "../../style/_";
import { StyleManager } from "../project/_";

export class InMemoryStyleManager extends StyleManager {
  rootStylesheet: Stylesheet;
  rootCssStylesheet: CssStyleSheet;
  get stylesheets(): CssStyleSheet[] {
    throw new Error("Method not implemented.");
  }
  get stylesheets$(): Observable<CssStyleSheet[]> {
    throw new Error("Method not implemented.");
  }
  cssSelectorOf(selector: ElllSelectorData): CssSelector {
    throw new Error("Method not implemented.");
  }
  cssSelectorOf$(selector: ElllSelectorData): Observable<CssSelector> {
    throw new Error("Method not implemented.");
  }
  variableValue(name: string) {
    throw new Error("Method not implemented.");
  }
  variableValue$(name: string): Observable<any> {
    throw new Error("Method not implemented.");
  }
  colorSchemeModifiers({
    colorScheme,
  }: {
    colorScheme: string;
  }): StyleModifierData[] {
    throw new Error("Method not implemented.");
  }
  colorSchemeModifiers$({
    colorScheme,
  }: {
    colorScheme: string;
  }): Observable<StyleModifierData[]> {
    throw new Error("Method not implemented.");
  }
  viewportModifiers({
    height,
    width,
  }: {
    height?: number;
    width?: number;
  }): StyleModifierData[] {
    throw new Error("Method not implemented.");
  }
  viewportModifiers$({
    height,
    width,
  }: {
    height?: number;
    width?: number;
  }): Observable<StyleModifierData[]> {
    throw new Error("Method not implemented.");
  }
  modifierToString(modifier: StyleModifierData): string {
    throw new Error("Method not implemented.");
  }
  modifierToString$(modifier: StyleModifierData): Observable<string> {
    throw new Error("Method not implemented.");
  }
  modifierToClassName(modifier: StyleModifierData): string {
    throw new Error("Method not implemented.");
  }
  modifierToClassName$(modifier: StyleModifierData): Observable<string> {
    throw new Error("Method not implemented.");
  }
  stringifyElllSelector(modifiers: StyleModifierData[]): string {
    throw new Error("Method not implemented.");
  }
  stringifyElllSelector$(modifiers: StyleModifierData[]): Observable<string> {
    throw new Error("Method not implemented.");
  }
  parseElllSelector(selector: string): StyleModifierData[] {
    throw new Error("Method not implemented.");
  }
  parseElllSelector$(selector: string): Observable<StyleModifierData[]> {
    throw new Error("Method not implemented.");
  }
}
