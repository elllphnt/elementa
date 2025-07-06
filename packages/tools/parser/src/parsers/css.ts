import type {
  GetModifierDefinition,
  StyleData,
  StyleSheetData} from "@elllphnt/elementa-base";
import {
  baseSelector,
  stringifyElllSelector,
  systemModifiers,
} from "@elllphnt/elementa-base";
import type { Root } from "postcss";
import postcss from "postcss";

export type ParsedKeyFrameSetData = {
  name: string;
  frames: Record<string, Record<string, string>>;
};
export type ParsedStyleRule = {
  selector: string[];
  style: Record<string, string>;
};

export type ParsedCssModule = {
  stylesheets?: Record<string, ParsedStyleRule[]>;
  keyframeSets?: ParsedKeyFrameSetData[];
};

function isIdSelector(selector: string): boolean {
  const idSelectorRe = /#-?[_A-Za-z][A-Za-z0-9_-]*/g;
  return idSelectorRe.test(selector);
}

/**
 * Merge parts from left-to-right:
 * - If a part contains '&', replace every '&' with the current result.
 * - Else if it’s a combinator (> + ~), append directly.
 * - Otherwise, join as a descendant with a space.
 */
function flattenSegments(segments: string[]): string {
  if (segments.length === 0) return "";

  let result = segments[0];
  for (let i = 1; i < segments.length; i++) {
    const part = segments[i];

    if (part.includes("&")) {
      // replace & with whatever we've built so far
      result = part.replace(/&/g, result);
    } else if (/^[>+~]/.test(part)) {
      // combinator glued on
      result = `${result}${part}`;
    } else {
      // plain descendant
      result = `${result} ${part}`;
    }
  }
  return result;
}

export function parseCssModule(css: string): ParsedCssModule {
  const root = postcss.parse(css) as Root;
  const stylesheets: Record<string, ParsedStyleRule[]> = {};
  const keyframeSets: ParsedKeyFrameSetData[] = [];

  function addRule(id: string, rule: ParsedStyleRule) {
    if (Object.keys(rule.style).length === 0) return; // Skip empty rules
    if (!stylesheets[id]) stylesheets[id] = [];
    stylesheets[id].push(rule);
  }

  function processNode(
    node: postcss.ChildNode,
    id?: string,
    selectors: string[] = []
  ) {
    switch (node.type) {
      case "rule": {
        node.selectors.map((selector) => {
          let thisId = id;
          const thisSelector = [...selectors];
          if (isIdSelector(selector)) {
            thisId = selector.slice(1);
          } else {
            thisSelector.push(selector);
          }
          const style: Record<string, string> = {};
          node.nodes.forEach((child) => {
            if (child.type === "decl") {
              style[child.prop] = child.value;
            } else {
              processNode(child, thisId, thisSelector);
            }
          });

          if (thisId) {
            addRule(thisId, {
              selector: thisSelector,
              style,
            });
          }
        });
        break;
      }
      case "atrule": {
        if (
          node.name === "media" ||
          node.name === "supports" ||
          node.name === "layer"
        ) {
          const selector = `@${node.name} ${node.params}`;
          const style: Record<string, string> = {};

          const thisSelector = [...selectors, selector];

          node.nodes?.forEach((child) => {
            if (child.type === "decl") {
              style[child.prop] = child.value;
            } else {
              processNode(child, id, thisSelector);
            }
          });

          if (id) {
            addRule(id, {
              selector: thisSelector,
              style,
            });
          }
        } else if (node.name === "keyframes") {
          const keyframeSet: ParsedKeyFrameSetData = {
            name: node.params,
            frames: {},
          };
          node.nodes?.forEach((frame) => {
            if (frame.type === "rule") {
              const frameSelector = frame.selectors.join(", ");
              const frameStyle: Record<string, string> = {};
              frame.nodes.forEach((child) => {
                if (child.type === "decl") {
                  frameStyle[child.prop] = child.value;
                }
              });
              keyframeSet.frames[frameSelector] = frameStyle;
            }
          });
          keyframeSets.push(keyframeSet);
        }
        break;
      }
    }
  }

  root.nodes.forEach((n) => processNode(n));
  return { stylesheets, keyframeSets };
}

export const hasClass = (selector: string, className: string) =>
  new RegExp(`(?:^|[\\s>+~])\\.${className}(?=[^\\w-]|$)`).test(selector);
export const hasId = (selector: string, id: string) =>
  new RegExp(`(?:^|[\\s>+~])\\#${id}(?=[^\\w-]|$)`).test(selector);

function cssSelectorToElllSelector({
  selector,
  getModifierDefinition,
}: {
  selector: string[];
  getModifierDefinition: GetModifierDefinition;
}) {
  const flattenedSelector = flattenSegments(selector).trim();
  if (!flattenedSelector) return baseSelector;

  const [elllSelector, error] = stringifyElllSelector({
    selector: [
      {
        name: systemModifiers.raw.name,
        args: [flattenedSelector],
      },
    ],
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
  id,
  cssModule,
  getModifierDefinition,
}: {
  id: string;
  cssModule: ParsedCssModule;
  getModifierDefinition: GetModifierDefinition;
}): Record<string, StyleData> {
  const styles: Record<string, StyleData> = {};
  const rules = cssModule.stylesheets?.[id] || [];

  for (const rule of rules) {
    const selector = cssSelectorToElllSelector({
      selector: rule.selector,
      getModifierDefinition,
    });
    const style: StyleData = {
      __raw: rule.style,
    };
    styles[selector || baseSelector] = style;
  }

  return styles;
}

export function getStylesheetFromCssModule({
  id,
  module,
  getModifierDefinition,
}: {
  id: string;
  classes: string[];
  conditionals: Record<string, string>;
  module: ParsedCssModule;
  getModifierDefinition: GetModifierDefinition;
}): StyleSheetData {
  const stylesheet: StyleSheetData = {};
  stylesheet.styles = {};
  stylesheet.conditions = {};

  const styles = getStylesFromCssModule({
    id,
    cssModule: module,
    getModifierDefinition,
  });
  for (const [selector, style] of Object.entries(styles)) {
    stylesheet.styles[selector || baseSelector] = {
      ...stylesheet.styles[selector],
      ...style,
    };
  }

  // for (const [className, expression] of Object.entries(conditionals)) {
  //   const styles = getStylesFromCssModule({
  //     className,
  //     cssModule: module,
  //     getModifierDefinition,
  //   });
  //   const conditionId = genId();
  //   const conditionModifier: StyleModifierData = {
  //     name: systemModifiers.condition.name,
  //     args: [conditionId],
  //   };
  //   const [conditionModifierString, error] = stringifyStyleModifier({
  //     modifier: conditionModifier,
  //     getModifierDefinition,
  //   });
  //   if (error) {
  //     throw new Error("Error converting condition modifier to string:", error);
  //   }

  //   for (const [selector, style] of Object.entries(styles)) {
  //     const selectorWithCondition = [selector, conditionModifierString]
  //       .filter(Boolean)
  //       .join(":");
  //     stylesheet.styles[selectorWithCondition] = {
  //       ...stylesheet.styles[selectorWithCondition],
  //       ...style,
  //     };
  //   }
  //   stylesheet.conditions[conditionId] = expression;
  // }

  return stylesheet;
}
