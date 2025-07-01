import { CssStyleRule, RuleCssStyleSheet } from "@elllphnt/elementa-models";
import { BehaviorSubject, map } from "rxjs";
import { styleLogger } from "../../../../loggers.js";
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

    styleLogger.info("RuleDomStyleSheetAdaptor created", {
      adaptor: this,
      styleSheet: this.styleSheet,
      target: this.styleSheet.target,
      initialRulesCount: this.styleSheet.rules.length,
    });

    const styleruleSubscription = this.styleSheet.rules$.subscribe((rules) => {
      styleLogger.debug("Style rules updated", {
        target: this.target,
        rulesCount: rules.length,
        existingAdaptorsCount: this._styleRuleAdaptors$.value.size,
      });

      const toRemove = new Map(this._styleRuleAdaptors$.value);
      const newMap = new Map<CssStyleRule, StyleRuleDomAdaptor>();

      for (const rule of rules) {
        const adaptor = this._styleRuleAdaptors$.value.get(rule);
        if (!adaptor) {
          styleLogger.debug("Creating new StyleRuleDomAdaptor", {
            target: this.target,
            ruleSelectors: rule.selectors,
          });
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
        styleLogger.debug("Disposing unused StyleRuleDomAdaptor", {
          target: this.target,
        });
        rule.dispose();
      }
    });

    this.addDisposer(() => {
      styleLogger.info("RuleDomStyleSheetAdaptor disposing", {
        target: this.target,
        adaptorsToDispose: this._styleRuleAdaptors$.value.size,
      });

      styleruleSubscription.unsubscribe();

      this._styleRuleAdaptors$.value.forEach((adaptor) => {
        adaptor.dispose();
      });
      this._styleRuleAdaptors$.next(new Map());
      this._styleRuleAdaptors$.complete();
    });
  }
}
