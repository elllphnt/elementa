import {
  CssSelector,
  ElllSelectorData,
  StyleDataData,
  StyleModifierData,
  VarRef,
} from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { CssStyleSheet } from "../../../../css/_.js";

/**
 * Manages styles, style variables, selectors, and modifiers in the Elementa project.
 *
 * The StyleManager provides functionality for:
 * - Managing CSS stylesheets
 * - Resolving variable references
 * - Handling style modifiers for color schemes and viewports
 * - Converting between Elementa selectors and CSS selectors
 */
export interface StyleManager {
  // Stylesheet

  /**
   * Array of CSS stylesheets managed by this StyleManager
   */
  readonly stylesheets: CssStyleSheet[];

  /**
   * Observable stream of CSS stylesheets managed by this StyleManager
   */
  readonly stylesheets$: Observable<CssStyleSheet[]>;

  // Variables

  /**
   * Resolves a variable reference to its actual style data value
   * @param varRef The variable reference to resolve
   * @returns The resolved style data value
   */
  varRefValue(varRef: VarRef): StyleDataData | undefined;

  /**
   * Observable stream that resolves a variable reference to its actual style data value
   * @param varRef The variable reference to resolve
   * @returns Observable stream of the resolved style data value
   */
  variableValue$(varRef: VarRef): Observable<StyleDataData | undefined>;

  // Modifiers

  /**
   * Generates style modifiers for a specific color scheme
   * @param args Object containing the color scheme name
   * @returns Array of style modifiers for the specified color scheme
   */
  colorSchemeModifiers(args: { colorScheme: string }): StyleModifierData[];

  /**
   * Observable stream of style modifiers for a specific color scheme
   * @param args Object containing the color scheme name
   * @returns Observable stream of style modifiers for the specified color scheme
   */
  colorSchemeModifiers$(args: {
    colorScheme: string;
  }): Observable<StyleModifierData[]>;

  /**
   * Generates style modifiers for a specific viewport size
   * @param args Object containing optional height and width dimensions
   * @returns Array of style modifiers for the specified viewport
   */
  viewportModifiers(args: {
    height?: number;
    width?: number;
  }): StyleModifierData[];

  /**
   * Observable stream of style modifiers for a specific viewport size
   * @param args Object containing optional height and width dimensions
   * @returns Observable stream of style modifiers for the specified viewport
   */
  viewportModifiers$(args: {
    height?: number;
    width?: number;
  }): Observable<StyleModifierData[]>;

  // Conversions

  /**
   * Converts a style modifier to its CSS class name representation
   * @param modifier The style modifier to convert
   * @returns The CSS class name for the modifier
   */
  modifierToClassName(modifier: StyleModifierData): string;

  /**
   * Observable stream that converts a style modifier to its CSS class name representation
   * @param modifier The style modifier to convert
   * @returns Observable stream of the CSS class name for the modifier
   */
  modifierToClassName$(modifier: StyleModifierData): Observable<string>;

  /**
   * Converts an Elementa selector to its CSS selector representation
   * @param selector The Elementa selector to convert
   * @returns The CSS selector
   */
  elllSelectorToCss(selector: ElllSelectorData): CssSelector;

  /**
   * Observable stream that converts an Elementa selector to its CSS selector representation
   * @param selector The Elementa selector to convert
   * @returns Observable stream of the CSS selector
   */
  elllSelectorToCss$(selector: ElllSelectorData): Observable<CssSelector>;

  /**
   * Parses a string selector into an array of style modifiers
   * @param selector The selector string to parse
   * @returns Array of style modifiers parsed from the selector string
   */
  elllSelectorFromString(selector: string): StyleModifierData[];

  /**
   * Observable stream that parses a string selector into an array of style modifiers
   * @param selector The selector string to parse
   * @returns Observable stream of style modifiers parsed from the selector string
   */
  elllSelectorFromString$(selector: string): Observable<StyleModifierData[]>;
}
