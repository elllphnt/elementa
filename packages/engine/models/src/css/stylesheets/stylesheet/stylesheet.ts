import { BehaviorSubject, map } from "rxjs";
import type { StyleClass } from "~/models/style/stylesheet/styleclass.js";
import { RuleCssStyleSheet } from "../../lib/rule/rule.js";
import { StyleClassCssStyleRule } from "./rule.js";

/**
 * Represents a CSS stylesheet that is composed of CSS style rules.
 * This class extends RuleCssStyleSheet and provides reactive management
 * of CSS rules.
 */
export class StyleClassCssStyleSheet extends RuleCssStyleSheet {
  readonly target: string;
  readonly styleClass: StyleClass;
  readonly layer?: string;
  private _rules$ = new BehaviorSubject<Record<string, StyleClassCssStyleRule>>(
    {}
  );

  get className() {
    return this.styleClass.className;
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
    styleClass,
    layer,
  }: {
    target: string;
    styleClass: StyleClass;
    layer?: string;
  }) {
    super();
    this.target = target;
    this.styleClass = styleClass;
    this.layer = layer;

    const rulesSubscription = this.styleClass.styles$.subscribe((styles) => {
      const toRemove = { ...this._rules$.value };
      const newRules: Record<string, StyleClassCssStyleRule> = {};

      for (const selector in styles) {
        if (toRemove[selector]) {
          newRules[selector] = toRemove[selector];
          delete toRemove[selector];
        } else {
          const rule = new StyleClassCssStyleRule({
            layer: this.layer,
            styleClass: this.styleClass,
            selector,
          });
          newRules[selector] = rule;
          this.addLifecycle(rule);
        }
      }

      for (const selector in toRemove) {
        toRemove[selector].dispose();
        this.removeLifecycle(toRemove[selector]);
      }

      this._rules$.next(newRules);
    });

    this.addDisposer(() => {
      rulesSubscription.unsubscribe();

      Object.values(this._rules$.value).forEach((rule) => rule.dispose());
      this._rules$.next({});
      this._rules$.complete();
    });
  }
}
