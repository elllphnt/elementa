import { CssStyleRule, RuleCssStyleSheet } from "@elllphnt/elementa-core";
import { BehaviorSubject, map } from "rxjs";
import { DomStyleSheetAdaptor } from "../stylesheet.js";
import { StyleRuleDomAdaptor } from "./stylerule.js";

export class RuleDomStyleSheetAdaptor extends DomStyleSheetAdaptor {
  readonly styleSheet: RuleCssStyleSheet;

  get target() {
    return this.styleSheet.target;
  }

  private _styleRuleAdaptors$ = new BehaviorSubject<
    Map<CssStyleRule, StyleRuleDomAdaptor>
  >(new Map());

  adaptorOf(styleRule: CssStyleRule) {
    return this._styleRuleAdaptors$.value.get(styleRule);
  }
  adaptorOf$(styleRule: CssStyleRule) {
    return this._styleRuleAdaptors$.pipe(map((map) => map.get(styleRule)));
  }

  constructor({ styleSheet }: { styleSheet: RuleCssStyleSheet }) {
    super();
    this.styleSheet = styleSheet;

    const styleruleSubscription = this.styleSheet.rules$.subscribe((rules) => {
      const toRemove = new Map(this._styleRuleAdaptors$.value);
      const newMap = new Map<CssStyleRule, StyleRuleDomAdaptor>();

      for (const rule of rules) {
        const adaptor = this._styleRuleAdaptors$.value.get(rule);
        if (!adaptor) {
          newMap.set(
            rule,
            new StyleRuleDomAdaptor({
              styleSheetAdaptor: this,
              styleRule: rule,
            })
          );
        } else {
          newMap.set(rule, adaptor);
          toRemove.delete(rule);
        }
      }

      this._styleRuleAdaptors$.next(newMap);

      for (const rule of toRemove.values()) {
        rule.dispose();
      }
    });

    this.addDisposer(() => {
      styleruleSubscription.unsubscribe();

      this._styleRuleAdaptors$.value.forEach((adaptor) => {
        adaptor.dispose();
      });
      this._styleRuleAdaptors$.next(new Map());
      this._styleRuleAdaptors$.complete();
    });
  }
}
