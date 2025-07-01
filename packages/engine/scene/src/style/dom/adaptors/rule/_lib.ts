import { CssSelector } from "@elllphnt/elementa-base";
import { normalizeSelector } from "@elllphnt/elementa-css";
import { styleLogger } from "../../../../loggers.js";

export function getCssStyleRuleFromStylesheet({
  styleSheet,
  selector: rawSelector,
  create,
}: {
  styleSheet: CSSStyleSheet;
  selector: CssSelector;
  create?: boolean;
}): CSSStyleRule | undefined {
  let ruleContainer: CSSGroupingRule | CSSStyleSheet = styleSheet;
  const selector = normalizeSelector(rawSelector);

  styleLogger.debug("getCssStyleRuleFromStylesheet", {
    selector: selector,
    create,
    stylesheetRulesCount: styleSheet.cssRules.length,
  });

  // Traverse the selector path to find or create the rule container
  for (const ruleText of selector.slice(0, -1)) {
    let foundRule: CSSGroupingRule | CSSStyleRule | undefined;

    // Search for the rule within the current container
    const ruleList = ruleContainer.cssRules;
    styleLogger.debug("Searching for rule in container", {
      ruleText,
      containerRulesCount: ruleList.length,
    });

    for (let i = 0; i < ruleList.length; i++) {
      const rule = ruleList[i];
      if (
        (rule instanceof CSSGroupingRule &&
          rule.cssText.startsWith(ruleText)) ||
        (rule instanceof CSSStyleRule && rule.selectorText === ruleText)
      ) {
        foundRule = rule as CSSGroupingRule | CSSStyleRule;
        styleLogger.debug("Found existing rule", {
          ruleText,
          ruleType: rule.constructor.name,
        });
        break;
      }
    }

    if (foundRule) {
      ruleContainer = foundRule as CSSGroupingRule;
    } else if (create) {
      styleLogger.debug("Creating new rule", { ruleText });
      const index = ruleContainer.insertRule(
        `${ruleText} {}`,
        ruleContainer.cssRules.length
      );
      foundRule = ruleContainer.cssRules[index] as
        | CSSGroupingRule
        | CSSStyleRule;
      ruleContainer = foundRule as CSSGroupingRule;
      styleLogger.debug("Created new rule at index", { index, ruleText });
    } else {
      styleLogger.debug("Rule not found and create=false", { ruleText });
      return undefined;
    }
  }

  // Find the style rule within the final rule container
  const ruleText = selector[selector.length - 1];
  const ruleList = ruleContainer.cssRules;
  styleLogger.debug("Searching for final style rule", {
    ruleText,
    containerRulesCount: ruleList.length,
  });

  for (let i = 0; i < ruleList.length; i++) {
    const rule = ruleList[i];
    if (rule instanceof CSSStyleRule && rule.selectorText === ruleText) {
      styleLogger.debug("Found existing style rule", { ruleText, index: i });
      return rule;
    }
  }
  if (create) {
    styleLogger.debug("Creating final style rule", { ruleText });
    const index = ruleContainer.insertRule(`${ruleText} {}`, ruleList.length);
    const createdRule = ruleContainer.cssRules[index] as CSSStyleRule;
    styleLogger.debug("Created final style rule at index", { index, ruleText });
    return createdRule;
  }

  styleLogger.debug("Style rule not found and create=false", { ruleText });
  return undefined;
}
