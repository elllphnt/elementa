import {
  baseSelector,
  GetModifierDefinition,
  stringifyElllSelector,
  stringifyStyleModifier,
  StyleData,
  StyleModifierData,
  StyleSheetData,
  systemModifiers,
} from "@elllphnt/elementa-base";
import postcss, { AtRule, Declaration, Rule } from "postcss";
import { genId } from "./component/_.js";

export type ParsedKeyFrameData = {
  offset: number;
  style: Record<string, string>;
};
export type ParsedKeyFrameSetData = {
  name: string;
  keyframes: ParsedKeyFrameData[];
};
export type ParsedStyleRule = {
  selector: string;
  style: Record<string, string>;
};

export type ParsedCssModule = {
  styles?: ParsedStyleRule[];
  keyframeSets?: ParsedKeyFrameSetData[];
};

export function parseCssModule(css: string): ParsedCssModule {
  const root = postcss.parse(css);

  const styles: ParsedStyleRule[] = [];
  const keyframeSets: ParsedKeyFrameSetData[] = [];

  root.walk((node) => {
    if (node.type === "rule") {
      const rule = node as Rule;
      const style: Record<string, string> = {};

      rule.walkDecls((decl: Declaration) => {
        style[decl.prop] = decl.value;
      });

      styles.push({
        selector: rule.selector,
        style,
      });
    }

    if (node.type === "atrule" && node.name === "keyframes") {
      const atRule = node as AtRule;
      const frames: ParsedKeyFrameData[] = [];

      atRule.walkRules((frameRule) => {
        const offsetRaw = frameRule.selector;
        const style: Record<string, string> = {};

        frameRule.walkDecls((decl: Declaration) => {
          style[decl.prop] = decl.value;
        });

        for (const part of offsetRaw.split(",")) {
          const trimmed = part.trim();
          let offset = parseFloat(trimmed.replace("%", "")) / 100;
          if (trimmed === "from") offset = 0;
          if (trimmed === "to") offset = 1;

          frames.push({ offset, style });
        }
      });

      keyframeSets.push({
        name: atRule.params,
        keyframes: frames,
      });
    }
  });

  return {
    styles: styles.length ? styles : undefined,
    keyframeSets: keyframeSets.length ? keyframeSets : undefined,
  };
}

const hasClass = (selector: string, className: string) =>
  new RegExp(`(?:^|[\\s>+~])\\.${className}(?=[^\\w-]|$)`).test(selector);

function cssSelectorToElllSelector({
  selector,
  base,
  getModifierDefinition,
}: {
  selector: string;
  base: string;
  getModifierDefinition: GetModifierDefinition;
}) {
  const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const nestableSelector = selector
    .replace(new RegExp(`${escaped}(?![a-zA-Z0-9_-])`, "g"), "&")
    .trim();
  console.log("Converted selector:", { nestableSelector, base, selector });
  if (!nestableSelector || nestableSelector === "&") {
    return "";
  }
  const modifier: StyleModifierData = {
    name: systemModifiers.raw.name,
    args: [nestableSelector],
  };
  const [elllSelector, error] = stringifyElllSelector({
    selector: [modifier],
    getModifierDefinition,
  });
  if (error) {
    throw new Error(
      `Error converting condition modifier to string: ${error.message}`
    );
  }

  return elllSelector;
}

export function getStylesFromCssModule({
  className,
  cssModule,
  getModifierDefinition,
}: {
  cssModule: ParsedCssModule;
  className: string;
  getModifierDefinition: GetModifierDefinition;
}): Record<string, StyleData> {
  const matchedRules =
    cssModule.styles?.filter((rule) => {
      return hasClass(rule.selector, className);
    }) || [];
  if (matchedRules.length === 0) return {};

  const styles: Record<string, StyleData> = {};
  for (const rule of matchedRules) {
    const selector = cssSelectorToElllSelector({
      selector: rule.selector,
      base: `.${className}`,
      getModifierDefinition,
    });
    const style: StyleData = {
      __raw: rule.style,
    };
    styles[selector] = style;
  }

  return styles;
}

export function getStylesheetFromCssModule({
  classes,
  conditionals,
  module,
  getModifierDefinition,
}: {
  classes: string[];
  conditionals: Record<string, string>;
  module: ParsedCssModule;
  getModifierDefinition: GetModifierDefinition;
}): StyleSheetData {
  const stylesheet: StyleSheetData = {};
  stylesheet.styles = {};
  stylesheet.conditions = {};

  for (const className of classes) {
    const styles = getStylesFromCssModule({
      className,
      cssModule: module,
      getModifierDefinition,
    });
    for (const [selector, style] of Object.entries(styles)) {
      stylesheet.styles[selector || baseSelector] = {
        ...stylesheet.styles[selector],
        ...style,
      };
    }
  }

  for (const [className, expression] of Object.entries(conditionals)) {
    const styles = getStylesFromCssModule({
      className,
      cssModule: module,
      getModifierDefinition,
    });
    const conditionId = genId();
    const conditionModifier: StyleModifierData = {
      name: systemModifiers.condition.name,
      args: [conditionId],
    };
    const [conditionModifierString, error] = stringifyStyleModifier({
      modifier: conditionModifier,
      getModifierDefinition,
    });
    if (error) {
      throw new Error("Error converting condition modifier to string:", error);
    }

    for (const [selector, style] of Object.entries(styles)) {
      const selectorWithCondition = [selector, conditionModifierString]
        .filter(Boolean)
        .join(":");
      stylesheet.styles[selectorWithCondition] = {
        ...stylesheet.styles[selectorWithCondition],
        ...style,
      };
    }
    stylesheet.conditions[conditionId] = expression;
  }

  return stylesheet;
}
