import { Observable } from "rxjs";
import { CssStyleSheet } from "../stylesheet";
import { cssStyleSheetTypes } from "../types";
import { CssStyleRule } from "./stylerule";

/**
 * A RuleCssStyleSheet represents a CSS stylesheet intended to be used
 * as a rule-based stylesheet. This means that the stylesheet is composed
 * of a list of rules that are applied to the DOM.
 *
 * It has a className that will be the base selector for all the rules
 * in the stylesheet.
 *
 * This class is expected to be extended by other classes that provide
 * more specific implementations of how the rules are created and managed.
 */
export abstract class RuleCssStyleSheet extends CssStyleSheet {
  abstract get rules(): CssStyleRule[];
  abstract get rules$(): Observable<CssStyleRule[]>;

  abstract get className(): string;

  constructor() {
    super({ type: cssStyleSheetTypes.rule });
  }
}
