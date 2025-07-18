import type {
  ElllSelectorData,
  GetModifierDefinition,
  KeyFrameGroupData,
  StyleClassData,
  StyleData,
  StyleModifierData,
} from "@elllphnt/elementa-base";
import {
  baseSelector,
  genId,
  stringifyElllSelector,
  systemModifiers,
} from "@elllphnt/elementa-base";
import {
  genBaseSelectorRegex,
  type ParsedCssModule,
  type ParsedKeyFrameSetData,
} from "./module.js";

/**
 * Merge nested selector segments into a flat CSS selector string.
 */
export function flattenSelectorSegments(segments: string[]): string {
  if (segments.length === 0) return "";
  let result = segments[0];
  for (let i = 1; i < segments.length; i++) {
    const part = segments[i];
    if (part.includes("&")) {
      result = part.replace(/&/g, result);
    } else if (/^[>+~]/.test(part)) {
      result = `${result}${part}`;
    } else {
      result = `${result} ${part}`;
    }
  }
  return result;
}

export function extractConditionsFromSelector({
  selector,
  conditions,
}: {
  selector: string;
  conditions: Record<string, string>; // className -> condition id
}): [StyleModifierData[], string | undefined] {
  const match = selector.search(/[>+~\s]/);
  let root: string, suffix: string;
  if (match === -1) {
    // no combinators, just a single selector
    root = selector;
    suffix = "";
  } else {
    root = selector.slice(0, match);
    suffix = selector.slice(match);
  }

  const mods: StyleModifierData[] = [];

  if (root.includes("&")) {
    for (const [className, conditionId] of Object.entries(conditions)) {
      // only match ".className" in the root part
      const re = genBaseSelectorRegex(`.${className}`);
      root = root.replace(re, () => {
        // record that we need a [condition:<conditionId>] modifier
        mods.push({
          name: systemModifiers.condition.name,
          args: [conditionId],
        });
        // strip it out of the root
        return "";
      });
    }
  }

  // recombine into a cleaned-up raw selector
  const rawSelector = (root + suffix).trim() || undefined;
  return [mods, rawSelector];
}

/**
 * Convert a raw selector segments array to an Elll selector string.
 */
function cssSelectorToElllSelector({
  selector,
  getModifierDefinition,
  conditions,
}: {
  selector: string[];
  getModifierDefinition: GetModifierDefinition;
  conditions: Record<string, string>; // className -> condition id
}): string {
  const atRules: string[] = [];
  const styleRules: string[] = [];
  for (const part of selector) {
    if (part.startsWith("@")) {
      atRules.push(part);
    } else {
      styleRules.push(part);
    }
  }
  const flat = flattenSelectorSegments(styleRules).trim();
  if (!flat) return baseSelector;

  const [conditionModifiers, rawSelector] = extractConditionsFromSelector({
    selector: flat,
    conditions,
  });
  const elllSelectorData: ElllSelectorData = [
    ...atRules.map((at) => ({
      name: systemModifiers.raw.name,
      args: [at],
    })),
    ...conditionModifiers,
  ];
  if (rawSelector && rawSelector !== "&") {
    elllSelectorData.push({
      name: systemModifiers.raw.name,
      args: [rawSelector],
    });
  }

  const [elllSelector, error] = stringifyElllSelector({
    selector: elllSelectorData,
    getModifierDefinition,
  });
  if (error) {
    throw new Error(`Error converting raw selector to Elll: ${error.message}`);
  }
  return elllSelector;
}

/**
 * Convert parsed keyframe set into Elll keyframe structure.
 */
function convertParsedKeyframeSetToElllKeyframe(kf: ParsedKeyFrameSetData) {
  return {
    id: genId(),
    name: kf.name,
    groups: kf.steps.map((step) => {
      const offsets = step.selector.map((s) => {
        if (s === "from") return 0;
        if (s === "to") return 1;
        const m = s.match(/^(\d+)%$/);
        return m ? parseFloat(m[1]) / 100 : 0;
      });
      const group: KeyFrameGroupData = {
        offsets,
        style: { __raw: step.style },
      };
      return group;
    }),
  };
}

/**
 * Extract style class data for a given element ID and its classes.
 */
export function getStyleClassFromCssModule({
  id,
  classes = [],
  module,
  getModifierDefinition,
}: {
  /** Element ID without the '#' prefix */
  id?: string;
  /** Array of class names or [name, expression] tuples */
  classes?: (string | [string, string])[];
  /** Parsed CSS module (ids, classes, keyframes) */
  module: ParsedCssModule;
  /** Callback to resolve modifier definitions */
  getModifierDefinition: GetModifierDefinition;
}): StyleClassData {
  const styles: Record<string, StyleData> = {};
  const conditionExpressionMap: Record<string, string> = {};
  const classNameConditionMap: Record<string, string> = {};
  const classList: string[] = [];

  // Process classes
  for (const cls of classes) {
    if (Array.isArray(cls)) {
      const conditionId = genId();
      const className = cls[0];
      const expression = cls[1];
      classList.push(className);
      conditionExpressionMap[conditionId] = expression;
      classNameConditionMap[className] = conditionId;
    } else {
      classList.push(cls);
    }
  }

  // 1) ID-scoped styles
  if (id) {
    const idSheet = module.ids.find((sheet) => sheet.name === id);
    if (idSheet) {
      for (const rule of idSheet.rules) {
        const sel = cssSelectorToElllSelector({
          selector: rule.selector,
          getModifierDefinition,
          conditions: classNameConditionMap,
        });
        styles[sel || baseSelector] = { __raw: rule.style };
      }
    }
  }

  // 2) Global class-based styles
  for (const cls of classList) {
    const classSheet = module.classes.find((s) => s.name === cls);
    if (!classSheet) continue;
    for (const rule of classSheet.rules) {
      const sel = cssSelectorToElllSelector({
        selector: [`&.${cls}`, ...rule.selector],
        getModifierDefinition,
        conditions: classNameConditionMap,
      });

      const selector = sel || baseSelector;

      // merge with existing styles if same selector
      styles[selector] = {
        ...styles[selector],
        __raw: {
          ...styles[selector]?.__raw,
          ...rule.style,
        },
      };
    }
  }

  return { styles, conditions: conditionExpressionMap };
}

/**
 * Extract all keyframe definitions from the CSS module.
 */
export function getKeyframesFromCssModule(module: ParsedCssModule) {
  return module.keyframes.map(convertParsedKeyframeSetToElllKeyframe);
}
