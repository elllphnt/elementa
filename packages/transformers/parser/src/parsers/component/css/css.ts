import type {
  GetModifierDefinition,
  KeyFrameGroupData,
  StyleSheetData,
} from "@elllphnt/elementa-base";
import {
  baseSelector,
  genId,
  stringifyElllSelector,
  systemModifiers,
} from "@elllphnt/elementa-base";
import {
  parseCssModule,
  type ParsedClassSheet,
  type ParsedKeyFrameSetData,
} from "./module.js";

/**
 * Merge parts from left-to-right:
 * - If a part contains '&', replace every '&' with the current result.
 * - Else if it’s a combinator (> + ~), append directly.
 * - Otherwise, join as a descendant with a space.
 */
function flattenSelectorSegments(segments: string[]): string {
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

function cssSelectorToElllSelector({
  selector,
  getModifierDefinition,
}: {
  selector: string[];
  getModifierDefinition: GetModifierDefinition;
}) {
  const flattenedSelector = flattenSelectorSegments(selector).trim();
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

function convertParsedClassToElllClass(cls: ParsedClassSheet) {
  return {
    name: cls.name,
    styles: Object.fromEntries(
      cls.rules.map((rule) => {
        const selector = cssSelectorToElllSelector({
          selector: rule.selector,
          getModifierDefinition: () => undefined,
        });
        return [selector || baseSelector, { __raw: rule.style }];
      })
    ),
    fragments: [],
  };
}

function convertParsedKeyframeSetToElllKeyframe(kf: ParsedKeyFrameSetData) {
  return {
    id: genId(),
    name: kf.name,
    groups: kf.steps.map((step) => {
      const keyframe: KeyFrameGroupData = {
        offsets: step.selector.map((s) => {
          if (s === "from") return 0;
          if (s === "to") return 1;
          const match = s.match(/^\d+%$/);
          if (match) {
            return parseFloat(match[0]) / 100;
          }
          return 0;
        }),
        style: { __raw: step.style },
      };

      return keyframe;
    }),
  };
}

export function parseStyleSheet(css: string): StyleSheetData {
  const module = parseCssModule(css);

  const stylesheet: StyleSheetData = {
    classes: module.classes.map(convertParsedClassToElllClass),
    keyframeSets: module.keyframes.map(convertParsedKeyframeSetToElllKeyframe),
  };

  return stylesheet;
}
