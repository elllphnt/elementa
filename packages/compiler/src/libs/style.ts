import {
  ContextData,
  contextToCssSelector,
  CSSGroupSelector,
  elllSelectorElementToCss,
  HyphenCssStyle,
  parseStyleSelector,
  StyleData,
  styleToCss,
} from "@elllphnt/elll-element";

// Compile a single CSS rule (e.g., ".button { color: red; }")
export function compileStyleRule(selector: string, properties: HyphenCssStyle) {
  return [
    `${selector} {`,
    Object.entries(properties)
      .map(([key, value]) => `${key}: ${value};`)
      .join(" "),
    `}`,
  ].join("");
}

// Compile all the styles related to a single selector
export function compileStyle({
  baseSelector,
  style,
}: {
  baseSelector: string;
  style: StyleData;
}): string {
  const { __styles, ...baseCss } = styleToCss(style);
  const ruleCodes: string[] = [];

  // Compile the base style rule
  ruleCodes.push(compileStyleRule(baseSelector, baseCss));

  // Compile additional styles for any state-specific selectors (e.g., :hover)
  for (const stateSelectorTemplate in __styles) {
    const stateStyle = __styles[stateSelectorTemplate];
    // Replace "&" with the base selector
    const resolvedSelector = stateSelectorTemplate.replaceAll(
      "&",
      baseSelector,
    );
    const stateStyleCode = compileStyleRule(resolvedSelector, stateStyle);
    ruleCodes.push(stateStyleCode);
  }

  // Return all compiled CSS rules as a single string
  return ruleCodes.join("\n");
}

// Compile an entire stylesheet for multiple selectors and their styles
export function compileStylesheet({
  baseSelector,
  styles,
  contexts = {},
}: {
  baseSelector: string;
  styles: Record<string, StyleData>;
  contexts?: Record<string, ContextData>;
}): string {
  const styleCodes = Object.entries(styles).map(
    ([elllSelectorString, style]) => {
      let group: CSSGroupSelector | undefined;
      const selector = parseStyleSelector(elllSelectorString);

      // Handle context (e.g., media queries)
      if (selector.context) {
        const context = contexts[selector.context.id];
        // Throw an error if the required context is missing
        if (!context) {
          throw new Error(
            `Context with id "${selector.context.id}" not found.`,
          );
        }
        group = contextToCssSelector(context);
      }

      // Compile the selector for the elements (with state handling)
      const resolvedBaseSelector = selector.elements
        .map((element) => elllSelectorElementToCss(baseSelector, element))
        .join(" ");
      const styleCode = compileStyle({
        baseSelector: resolvedBaseSelector,
        style,
      });

      // Wrap the styles in context rules (e.g., @media)
      if (group) {
        return [`@${group.type} ${group.condition} {`, styleCode, `}`].join(
          "\n",
        );
      } else {
        return styleCode;
      }
    },
  );

  // Return the final compiled CSS as a string
  return styleCodes.filter(Boolean).join("\n");
}
