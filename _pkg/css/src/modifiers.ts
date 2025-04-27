import {
  CssSelector,
  ElllSelectorData,
  ErrorTupple,
  stringifyStyleData,
  StyleModifierData,
  StyleModifierDefinitionData,
  systemModifiers,
} from "@elllphnt/elementa-base";
import { populateTemplateString } from "./utils/string";

function getSystemModifierDefinition(
  name: string
): StyleModifierDefinitionData | undefined {
  return systemModifiers[name];
}

export function styleModifierToCssSelector({
  modifier,
  getModifierDefinition,
}: {
  modifier: StyleModifierData;
  getModifierDefinition: (
    name: string
  ) => StyleModifierDefinitionData | undefined;
}): ErrorTupple<CssSelector> {
  const definition =
    getSystemModifierDefinition(modifier.name) ||
    getModifierDefinition(modifier.name);
  if (!definition) {
    const error = new Error(`Unknown modifier: ${modifier.name}`);
    return [undefined, error];
  }
  if ((modifier.args?.length ?? 0) !== (definition.signature?.length ?? 0)) {
    const error = new Error(
      `Mismatched number of arguments for modifier ${modifier.name}. Expected ${
        definition.signature?.length ?? 0
      }, got ${modifier.args?.length ?? 0}`
    );
    return [undefined, error];
  }

  const args = definition.signature?.map((type, index) =>
    stringifyStyleData(type, modifier.args?.[index])
  );
  const selector =
    (args?.length
      ? definition.selector?.map((t) => populateTemplateString(t, args))
      : definition.selector) || [];

  return [selector, undefined];
}

export function elllSelectorToCssSelector({
  selector,
  getModifierDefinition,
}: {
  selector: ElllSelectorData;
  getModifierDefinition: (
    name: string
  ) => StyleModifierDefinitionData | undefined;
}): ErrorTupple<CssSelector> {
  let cssSelector: CssSelector = [];

  for (const modifier of selector) {
    const [modifierSelector, error] = styleModifierToCssSelector({
      modifier,
      getModifierDefinition,
    });
    if (error) return [undefined, error];
    cssSelector = cssSelector.concat(modifierSelector);
  }

  return [cssSelector, undefined];
}
