import {
  GetModifierDefinition,
  parseElllSelector,
  StyleSheetData,
} from "@elllphnt/elementa-base";
import {
  CssStyleData,
  elllSelectorToCssSelector,
  styleToCss,
} from "@elllphnt/elementa-css";

export function cssStyleDataToString(
  styleData: CssStyleData,
  selector: string,
  indent = ""
): string {
  if (selector) {
    let css = `${indent}${selector} {\n`;
    css += serializeStyle(styleData, indent + "  ");
    css += `${indent}}\n`;
    return css;
  } else {
    return serializeStyle(styleData, indent + "  ");
  }
}

function serializeStyle(styleData: CssStyleData, indent: string): string {
  let css = "";

  for (const key in styleData) {
    const value = styleData[key];

    if (typeof value === "string") {
      css += `${indent}${key}: ${value};\n`;
    } else if (typeof value === "object" && value !== null) {
      css += `${indent}${key} {\n`;
      css += serializeStyle(value, indent + "  ");
      css += `${indent}}\n`;
    }
  }

  return css;
}

/**
 * Merge parts from left-to-right:
 * - If a part contains '&', replace every '&' with the current result.
 * - Else if it’s a combinator (> + ~), append directly.
 * - Otherwise, join as a descendant with a space.
 */
function flattenCssSelector(segments: string[]): string {
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

// Compile an entire stylesheet for multiple selectors and their styles
export function compileStylesheet({
  selector,
  stylesheet,
  getModifierDefinition,
}: {
  selector: string;
  stylesheet: StyleSheetData;
  getModifierDefinition: GetModifierDefinition;
}): string {
  const compiledStyles: string[] = [];
  const errors: Error[] = [];

  for (const selector in stylesheet.styles) {
    const styleData = stylesheet.styles[selector];
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
      getFragment: (type, id) => {
        return stylesheet.fragments?.find(
          (f) => f.id === id && f.type === type
        ) as any;
      },
    });
    if (cssErrors.length > 0) {
      errors.push(...cssErrors);
    }

    if (Object.keys(css).length) {
      compiledStyles.push(
        cssStyleDataToString(css, flattenCssSelector(cssSelector))
      );
    }
  }

  const code = [`${selector} {`, compiledStyles.join("\n\n"), `}`].join("\n");

  return code;
}
