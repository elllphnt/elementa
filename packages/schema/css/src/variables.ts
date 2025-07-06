import type {
  CssSelector,
  ErrorTupple,
  StyleModifierDefinitionData,
  StyleVariableSetData} from "@elllphnt/elementa-base";
import {
  baseSelector,
  stringifyElllSelector,
  stringifyStyleData
} from "@elllphnt/elementa-base";
import { applySelectedCssStyle } from "./base/selector.js";
import type { CssStyleData } from "./base/types.js";
import { elllSelectorToCssSelector } from "./modifiers.js";

export function variableSetToCss({
  set,
  getModifierDefinition,
}: {
  set: StyleVariableSetData;
  getModifierDefinition: (
    name: string
  ) => StyleModifierDefinitionData | undefined;
}): ErrorTupple<CssStyleData> {
  const datatype = set.datatype;
  if (!datatype) {
    return [undefined, new Error("")];
  }
  const stringify = (value: any) => stringifyStyleData(datatype, value);
  const selectors: Array<{ css: CssSelector; elll: string }> = [];
  const css: CssStyleData = {};

  // build selectors
  for (const mode of set.modes ?? []) {
    const [elllSelector, elllSelectorError] = stringifyElllSelector({
      selector: mode,
      getModifierDefinition,
    });
    if (elllSelectorError) {
      return [undefined, elllSelectorError];
    }

    const [cssSelector, cssSelectorError] = elllSelectorToCssSelector({
      selector: mode,
      getModifierDefinition,
    });
    if (cssSelectorError) {
      return [undefined, cssSelectorError];
    }

    selectors.push({ elll: elllSelector, css: cssSelector });
  }

  for (const variable of set.variables) {
    const values = variable.values;
    const name = variable.name;
    if (!values || !name) {
      continue;
    }
    const varName = `--${name}`;
    const defaultValue = values[baseSelector];
    if (defaultValue != undefined) {
      css[varName] = stringify(defaultValue);
    }

    for (const selector of selectors) {
      const value = values[selector.elll];
      if (value != undefined) {
        applySelectedCssStyle({
          target: css,
          selector: selector.css,
          style: {
            [varName]: stringify(value),
          },
        });
      }
    }
  }

  return [css, undefined];
}
