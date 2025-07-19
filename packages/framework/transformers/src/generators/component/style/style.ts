import type {
  GetModifierDefinition,
  KeyframeSetData,
  StyleClassData,
} from "@elllphnt/elementa-base";
import { parseElllSelector } from "@elllphnt/elementa-base";
import type { CssStyleData } from "@elllphnt/elementa-css";
import {
  elllSelectorToCssSelector,
  keyFrameSetToCss,
  styleToCss,
} from "@elllphnt/elementa-css";

/** Print a flat CSS block. */
function cssStyleDataToString(
  styleData: CssStyleData,
  selector: string,
  indent = "  "
): string {
  // Print selector and rules in minimal, predictable style.
  let css = selector ? `${selector} {\n` : "";
  css += serializeStyle(styleData, indent);
  css += selector ? `}\n` : "";
  return css;
}

/** Print a flat object of CSS properties, sorted by key for deterministic output. */
function serializeStyle(styleData: CssStyleData, indent: string): string {
  let css = "";
  for (const key of Object.keys(styleData)) {
    const value = styleData[key];
    if (typeof value === "string") {
      css += `${indent}${key}: ${value};\n`;
    }
    // We *avoid* nested rules here to ensure only flat CSS (no accidental nesting)
    // If you ever want to support nested rules, add a flag!
  }
  return css;
}

/**
 * Merge selector segments using rules:
 * - If part contains &, replace all & with accumulated selector.
 * - If part is a combinator, append directly.
 * - Else, join as a descendant with a space.
 */
function flattenCssSelector(segments: string[]): string {
  if (!segments.length) return "";
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

/**
 * Compile a style class into a CSS block.
 * - Outputs a wrapper block with #id selector (if present).
 * - Each sub-selector is flattened and printed in order.
 */
export function compileStyleClass({
  id,
  styleClass,
  getModifierDefinition,
}: {
  id: string;
  styleClass: StyleClassData;
  getModifierDefinition: GetModifierDefinition;
}): string {
  const compiledStyles: string[] = [];
  const errors: Error[] = [];

  for (const selector in styleClass.styles) {
    const styleData = styleClass.styles[selector];
    const [elllSelector, elllSelectorError] = parseElllSelector({
      selector,
      getModifierDefinition,
    });
    if (elllSelectorError) {
      errors.push(elllSelectorError);
      continue;
    }
    const [cssSelector, cssSelectorError] = elllSelectorToCssSelector({
      selector: elllSelector,
      getModifierDefinition,
    });
    if (cssSelectorError) {
      errors.push(cssSelectorError);
      continue;
    }

    const [css, cssErrors] = styleToCss(styleData, {
      getFragment: (type, id) =>
        styleClass.fragments?.find(
          (f) => f.id === id && f.type === type
        ) as any,
    });
    if (cssErrors.length > 0) {
      errors.push(...cssErrors);
    }

    // Only print if this selector has rules.
    if (Object.keys(css).length) {
      const flatSelector = flattenCssSelector(cssSelector);
      compiledStyles.push(cssStyleDataToString(css, flatSelector));
    }
  }

  // Print as a "bundle" if id is present, else as normal rules.
  if (compiledStyles.length) {
    const stylesLines = compiledStyles
      .join("\n")
      .trim()
      .split("\n")
      .map((line) => `  ${line}`);
    return [
      `#${id} {`,
      ...stylesLines,
      `}`,
      ...errors.map((e) => `/* Error: ${e.message} */`),
    ].join("\n");
  } else {
    return "";
  }
}

/**
 * Print the full stylesheet for all style classes and keyframes.
 */
export function generateCssStylesheet({
  styleClasses,
  keyframes,
  getModifierDefinition,
}: {
  styleClasses: Record<string, StyleClassData>;
  keyframes: KeyframeSetData[];
  getModifierDefinition: GetModifierDefinition;
}): string {
  const classes = Object.entries(styleClasses).map(([id, styleClass]) =>
    compileStyleClass({
      id,
      styleClass,
      getModifierDefinition,
    })
  );
  const keyframeSets = keyframes?.map((keyframeSet) =>
    keyFrameSetToCss(keyframeSet)
  );

  // Remove any empty entries, and join with *single* blank lines.
  return [...classes, ...(keyframeSets || [])]
    .filter(Boolean)
    .map((code) => code.trim())
    .filter(Boolean)
    .join("\n\n");
}
