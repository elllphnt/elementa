import { BehaviorSubject, map } from "rxjs";
import { Stylesheet } from "../../../style/stylesheet.js";
import { RuleCssStyleSheet } from "../../lib/rule/rule.js";
import { StylesheetCssStyleRule } from "./rule.js";

/**
 * Represents a CSS stylesheet that is composed of CSS style rules.
 * This class extends RuleCssStyleSheet and provides reactive management
 * of CSS rules.
 */
export class StylesheetCssStyleSheet extends RuleCssStyleSheet {
  readonly target: string;
  readonly stylesheet: Stylesheet;
  readonly layer?: string;
  private _rules$ = new BehaviorSubject<Record<string, StylesheetCssStyleRule>>(
    {}
  );

  get className() {
    return this.stylesheet.className;
  }

  get rules() {
    return Object.values(this._rules$.value);
  }

  get rules$() {
    return this._rules$
      .asObservable()
      .pipe(map((rules) => Object.values(rules)));
  }

  get ruleMap() {
    return this._rules$.value;
  }
  get ruleMap$() {
    return this._rules$.asObservable();
  }

  rule(selector: string) {
    return this._rules$.value[selector];
  }
  rule$(selector: string) {
    return this._rules$.pipe(map((rules) => rules[selector]));
  }

  constructor({
    target,
    stylesheet,
    layer,
  }: {
    target: string;
    stylesheet: Stylesheet;
    layer?: string;
  }) {
    super();
    this.target = target;
    this.stylesheet = stylesheet;
    this.layer = layer;

    const rulesSubscription = this.stylesheet.styles.observable$.subscribe(
      (styles) => {
        const toRemove = { ...this._rules$.value };
        const newRules: Record<string, StylesheetCssStyleRule> = {};

        for (const selector in styles) {
          if (toRemove[selector]) {
            newRules[selector] = toRemove[selector];
            delete toRemove[selector];
          } else {
            newRules[selector] = new StylesheetCssStyleRule({
              layer: this.layer,
              stylesheet: this.stylesheet,
              selector,
            });
          }
        }

        for (const selector in toRemove) {
          toRemove[selector].dispose();
        }

        this._rules$.next(newRules);
      }
    );

    this.addDisposer(() => {
      rulesSubscription.unsubscribe();

      Object.values(this._rules$.value).forEach((rule) => rule.dispose());
      this._rules$.next({});
      this._rules$.complete();
    });
  }
}
