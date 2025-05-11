import { CssStyleData } from "@elllphnt/elementa-css";
import { CssStyleRule } from "@elllphnt/elementa-models";
import {
  DeepPartial,
  Disposable,
  pairwiseOrEmpty,
} from "@elllphnt/elementa-utils";
import { diff } from "deep-object-diff";
import { Subject } from "rxjs";
import { getCssStyleRuleFromStylesheet } from "./_lib.js";
import { RuleDomStyleSheetAdaptor } from "./rule.js";

export class StyleRuleDomAdaptor extends Disposable {
  readonly styleSheetAdaptor: RuleDomStyleSheetAdaptor;
  readonly styleRule: CssStyleRule;

  private _cssStyleRule = new WeakMap<CSSStyleSheet, CSSStyleRule[]>();
  private _updated$ = new Subject<string[]>();

  get updated$() {
    return this._updated$.asObservable();
  }

  constructor({
    styleSheetAdaptor,
    styleRule,
  }: {
    styleSheetAdaptor: RuleDomStyleSheetAdaptor;
    styleRule: CssStyleRule;
  }) {
    super();
    this.styleSheetAdaptor = styleSheetAdaptor;
    this.styleRule = styleRule;

    // sync style sheets
    const styleSheetSubscription =
      this.styleSheetAdaptor.cssStyleSheets$.subscribe((styleSheets) => {
        for (const styleSheet of styleSheets) {
          if (!this._cssStyleRule.has(styleSheet)) {
            this.patchCssStylesheet(styleSheet, this.styleRule.styleData);
          }
        }
      });

    // apply style diff on properties update
    const styleSubscription = this.styleRule.styleData$
      .pipe(pairwiseOrEmpty())
      .subscribe(([prevStyle, nextStyle]) => {
        const _diff = diff(prevStyle ?? {}, nextStyle);
        this.patchAllStyleSheets(_diff);
        this._updated$.next(Object.keys(_diff));
      });

    // update style rules on selector update
    const selectorSubscription = this.styleRule.selectors$?.subscribe(() => {
      for (const styleSheet of this.styleSheetAdaptor.cssStyleSheets) {
        this.updateCssStyleRules(styleSheet);
      }
    });

    this.addDisposer(() => {
      styleSheetSubscription.unsubscribe();
      styleSubscription.unsubscribe();
      selectorSubscription?.unsubscribe();
    });
  }

  getCSSStyleRulesFromCssStylesheet({
    styleSheet,
  }: {
    styleSheet: CSSStyleSheet;
  }): CSSStyleRule[] {
    const cssStyleRules = this.styleRule.selectors.map((selector) => {
      const cssStyleRule = getCssStyleRuleFromStylesheet({
        styleSheet,
        selector,
        create: true,
      });

      if (!cssStyleRule) {
        throw new Error("Failed to create CSSStyleRule");
      }

      return cssStyleRule;
    });

    return cssStyleRules;
  }
  getCssStyleRules(cssStyleSheet: CSSStyleSheet): CSSStyleRule[] {
    let styleRules = this._cssStyleRule.get(cssStyleSheet);
    if (!styleRules) {
      styleRules = this.getCSSStyleRulesFromCssStylesheet({
        styleSheet: cssStyleSheet,
      });
      this._cssStyleRule.set(cssStyleSheet, styleRules);
    }
    return styleRules;
  }
  updateCssStyleRules(cssStyleSheet: CSSStyleSheet) {
    const toDelete = new Set(this._cssStyleRule.get(cssStyleSheet));
    const newRules = this.getCSSStyleRulesFromCssStylesheet({
      styleSheet: cssStyleSheet,
    });
    for (const rule of newRules) {
      const deleted = toDelete.delete(rule);
      if (!deleted) {
        // this is a new rule, we will initialize it
        this.patchCssStyleRule(rule, this.styleRule.styleData);
      }
    }
    for (const rule of toDelete) {
      rule.style.cssText = "";
    }
    this._cssStyleRule.set(cssStyleSheet, newRules);
  }
  patchSubCssStyleRule(
    cssStyleRule: CSSStyleRule,
    selector: string,
    diff: DeepPartial<CssStyleData> | undefined
  ) {
    let ruleIndex: number | undefined = undefined;
    for (let i = 0; i < cssStyleRule.cssRules.length; i++) {
      const rule = cssStyleRule.cssRules[i];
      if (rule.constructor.name === "CSSStyleRule") {
        const cssRule = rule as CSSStyleRule;
        if (cssRule.selectorText === selector) {
          ruleIndex = i;
          break;
        }
      }
    }

    if (ruleIndex === undefined) {
      // rule not found
      // if diff is provided, we will create a new rule
      // otherwise, we will ignore

      if (diff) {
        ruleIndex = cssStyleRule.insertRule(`${selector} {}`);
      } else {
        return;
      }
    }

    if (diff) {
      const cssRule = cssStyleRule.cssRules[ruleIndex] as CSSStyleRule;
      this.patchCssStyleRule(cssRule, diff);
    } else {
      cssStyleRule.deleteRule(ruleIndex);
    }
  }
  patchCssStyleRule(
    cssStyleRule: CSSStyleRule,
    diff: DeepPartial<CssStyleData>
  ) {
    for (const property in diff) {
      const value = diff[property];
      if (typeof value === "object") {
        this.patchSubCssStyleRule(cssStyleRule, property, value);
      } else if (value === undefined) {
        cssStyleRule.style.removeProperty(property) ||
          this.patchSubCssStyleRule(cssStyleRule, property, undefined);
      } else {
        cssStyleRule.style.setProperty(property, value);
      }
    }
  }

  patchCssStylesheet(
    cssStyleSheet: CSSStyleSheet,
    diff: DeepPartial<CssStyleData>
  ) {
    const cssRules = this.getCssStyleRules(cssStyleSheet);
    for (const cssRule of cssRules) {
      this.patchCssStyleRule(cssRule, diff);
    }
  }
  patchAllStyleSheets(diff: Partial<CssStyleData>) {
    for (const cssStyleSheet of this.styleSheetAdaptor.cssStyleSheets) {
      if (!cssStyleSheet) continue;
      this.patchCssStylesheet(cssStyleSheet, diff);
    }
  }
}
