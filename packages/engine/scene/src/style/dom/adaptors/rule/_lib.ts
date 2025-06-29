import { CssSelector } from "@elllphnt/elementa-base";
import { normalizeSelector } from "@elllphnt/elementa-css";

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

  // Traverse the selector path to find or create the rule container
  for (const ruleText of selector.slice(0, -1)) {
    let foundRule: CSSGroupingRule | CSSStyleRule | undefined;

    // Search for the rule within the current container
    const ruleList = ruleContainer.cssRules;
    for (let i = 0; i < ruleList.length; i++) {
      const rule = ruleList[i];
      if (
        (rule instanceof CSSGroupingRule &&
          rule.cssText.startsWith(ruleText)) ||
        (rule instanceof CSSStyleRule && rule.selectorText === ruleText)
      ) {
        foundRule = rule as CSSGroupingRule | CSSStyleRule;
        break;
      }
    }

    if (foundRule) {
      ruleContainer = foundRule as CSSGroupingRule;
    } else if (create) {
      const index = ruleContainer.insertRule(
        `${ruleText} {}`,
        ruleContainer.cssRules.length
      );
      foundRule = ruleContainer.cssRules[index] as
        | CSSGroupingRule
        | CSSStyleRule;
      ruleContainer = foundRule as CSSGroupingRule;
    } else {
      return undefined;
    }
  }

  // Find the style rule within the final rule container
  const ruleText = selector[selector.length - 1];
  const ruleList = ruleContainer.cssRules;
  for (let i = 0; i < ruleList.length; i++) {
    const rule = ruleList[i];
    if (rule instanceof CSSStyleRule && rule.selectorText === ruleText) {
      return rule;
    }
  }
  if (create) {
    const index = ruleContainer.insertRule(`${ruleText} {}`, ruleList.length);
    return ruleContainer.cssRules[index] as CSSStyleRule;
  }

  return undefined;
}
