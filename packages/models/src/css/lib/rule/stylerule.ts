import { CssSelector } from "@elllphnt/elementa-base";
import { CssStyleData } from "@elllphnt/elementa-css";
import { Disposable } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";

/**
 * Represents a CSS style rule.
 * This class does not implement any logic, but defines the
 * interface for consuming CSS style rules in a reactive manner.
 */
export abstract class CssStyleRule extends Disposable {
  abstract get selectors(): CssSelector[];
  abstract get selectors$(): Observable<CssSelector[]> | undefined;

  abstract get styleData(): CssStyleData;
  abstract get styleData$(): Observable<CssStyleData>;
}
