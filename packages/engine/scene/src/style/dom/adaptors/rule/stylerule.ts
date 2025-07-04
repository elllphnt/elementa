import type { CssStyleData } from "@elllphnt/elementa-css";
import { Lifecycle } from "@elllphnt/elementa-kernel";
import type { DeepPartial} from "@elllphnt/elementa-lang-utils";
import { pairwiseOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { CssStyleRule } from "@elllphnt/elementa-models";
import { diff } from "deep-object-diff";
import { Subject } from "rxjs";
import { styleLogger } from "../../../../loggers.js";
import { getCssStyleRuleFromStylesheet } from "./_lib.js";
import type { RuleDomStyleSheetAdaptor } from "./rule.js";

export class StyleRuleDomAdaptor extends Lifecycle {
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

    styleLogger.info("StyleRuleDomAdaptor created", {
      target: styleSheetAdaptor.target,
      selectors: styleRule.selectors,
      initialStylePropertiesCount: Object.keys(styleRule.styleData).length,
    });

    // sync style sheets
    const styleSheetSubscription =
      this.styleSheetAdaptor.cssStyleSheets$.subscribe((styleSheets) => {
        styleLogger.debug("CSS stylesheets updated for StyleRuleDomAdaptor", {
          target: this.styleSheetAdaptor.target,
          styleSheetsCount: styleSheets.length,
        });

        for (const styleSheet of styleSheets) {
          if (!this._cssStyleRule.has(styleSheet)) {
            styleLogger.debug("Patching new CSS stylesheet", {
              target: this.styleSheetAdaptor.target,
              selectors: this.styleRule.selectors,
            });
            this.patchCssStylesheet(styleSheet, this.styleRule.styleData);
          }
        }
      });

    // apply style diff on properties update
    const styleSubscription = this.styleRule.styleData$
      .pipe(pairwiseOrEmpty())
      .subscribe(([prevStyle, nextStyle]) => {
        const _diff = diff(prevStyle ?? {}, nextStyle);
        const changedProperties = Object.keys(_diff);

        styleLogger.debug("Style data updated", {
          target: this.styleSheetAdaptor.target,
          selectors: this.styleRule.selectors,
          changedProperties,
          diffSize: changedProperties.length,
        });

        this.patchAllStyleSheets(_diff);
        this._updated$.next(changedProperties);
      });

    // update style rules on selector update
    const selectorSubscription = this.styleRule.selectors$?.subscribe(() => {
      styleLogger.debug("Selectors updated", {
        target: this.styleSheetAdaptor.target,
        newSelectors: this.styleRule.selectors,
      });

      for (const styleSheet of this.styleSheetAdaptor.cssStyleSheets) {
        this.updateCssStyleRules(styleSheet);
      }
    });

    this.addDisposer(() => {
      styleLogger.info("StyleRuleDomAdaptor disposing", {
        target: this.styleSheetAdaptor.target,
        selectors: this.styleRule.selectors,
      });

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
    styleLogger.debug("Getting CSS style rules from stylesheet", {
      target: this.styleSheetAdaptor.target,
      selectors: this.styleRule.selectors,
      stylesheetRulesCount: styleSheet.cssRules.length,
    });

    const cssStyleRules = this.styleRule.selectors.map((selector) => {
      const cssStyleRule = getCssStyleRuleFromStylesheet({
        styleSheet,
        selector,
        create: true,
      });

      styleLogger.debug("Retrieved/created CSS style rule", {
        target: this.styleSheetAdaptor.target,
        selector,
        ruleCreated: !!cssStyleRule,
      });

      if (!cssStyleRule) {
        styleLogger.error("Failed to create CSSStyleRule", {
          target: this.styleSheetAdaptor.target,
          selector,
        });
        throw new Error("Failed to create CSSStyleRule");
      }

      return cssStyleRule;
    });

    styleLogger.debug("Created CSS style rules", {
      target: this.styleSheetAdaptor.target,
      rulesCreated: cssStyleRules.length,
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
    const propertiesToUpdate = Object.keys(diff);
    styleLogger.debug("Patching CSS style rule", {
      target: this.styleSheetAdaptor.target,
      selector: cssStyleRule.selectorText,
      propertiesToUpdate,
      propertiesCount: propertiesToUpdate.length,
    });

    for (const property in diff) {
      const value = diff[property];
      if (typeof value === "object") {
        styleLogger.debug("Patching sub-rule", {
          target: this.styleSheetAdaptor.target,
          parentSelector: cssStyleRule.selectorText,
          subSelector: property,
        });
        this.patchSubCssStyleRule(cssStyleRule, property, value);
      } else if (value === undefined) {
        styleLogger.debug("Removing property", {
          target: this.styleSheetAdaptor.target,
          selector: cssStyleRule.selectorText,
          property,
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        cssStyleRule.style.removeProperty(property) ||
          this.patchSubCssStyleRule(cssStyleRule, property, undefined);
      } else {
        styleLogger.debug("Setting property", {
          target: this.styleSheetAdaptor.target,
          selector: cssStyleRule.selectorText,
          property,
          value,
        });
        cssStyleRule.style.setProperty(property, value);
      }
    }
  }

  patchCssStylesheet(
    cssStyleSheet: CSSStyleSheet,
    diff: DeepPartial<CssStyleData>
  ) {
    styleLogger.debug("Patching CSS stylesheet", {
      target: this.styleSheetAdaptor.target,
      stylesheetRulesCount: cssStyleSheet.cssRules.length,
      diffProperties: Object.keys(diff),
    });

    const cssRules = this.getCssStyleRules(cssStyleSheet);
    for (const cssRule of cssRules) {
      this.patchCssStyleRule(cssRule, diff);
    }
  }

  patchAllStyleSheets(diff: Partial<CssStyleData>) {
    styleLogger.debug("Patching all stylesheets", {
      target: this.styleSheetAdaptor.target,
      styleSheetsCount: this.styleSheetAdaptor.cssStyleSheets.length,
      diffProperties: Object.keys(diff),
    });

    for (const cssStyleSheet of this.styleSheetAdaptor.cssStyleSheets) {
      if (!cssStyleSheet) continue;
      this.patchCssStylesheet(cssStyleSheet, diff);
    }
  }
}
