import type { CssSelector } from "@elllphnt/elementa-base";
import type { CssStyleData } from "@elllphnt/elementa-css";
import { Lifecycle } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";

/**
 * Represents a CSS style rule.
 * This class does not implement any logic, but defines the
 * interface for consuming CSS style rules in a reactive manner.
 */
export abstract class CssStyleRule extends Lifecycle {
  abstract get selectors(): CssSelector[];
  abstract get selectors$(): Observable<CssSelector[]> | undefined;

  abstract get styleData(): CssStyleData;
  abstract get styleData$(): Observable<CssStyleData>;
}
