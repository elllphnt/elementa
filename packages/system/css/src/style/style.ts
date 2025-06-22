import {
  StyleData,
  StyleFragmentData,
  StyleFragmentType,
  StylePropertyName,
} from "@elllphnt/elementa-base";
import { CssStyleData, HyphenCssStyle } from "../base/types.js";
import { stripUndefined } from "../utils/object.js";
import { applyDefaultCss, styleToCssPropertyConfigMap } from "./properties.js";

export type StyleToCssContext = {
  getFragment: <T extends StyleFragmentType>(
    type: T,
    id: string
  ) => StyleFragmentData<T> | undefined;
};

function processProperty({
  property,
  value,
  css,
  context,
}: {
  property: string;
  value: any;
  css: HyphenCssStyle;
  context: StyleToCssContext;
}) {
  if (value == undefined || value == "unset") {
    return;
  }
  const config = styleToCssPropertyConfigMap[property as StylePropertyName];
  if (config?.applyCustomCss) {
    config.applyCustomCss(css, value, context);
  } else {
    applyDefaultCss(css, property, value);
  }
}

export function styleToCss(
  data: StyleData,
  context: StyleToCssContext
): [CssStyleData, Error[]] {
  let css: HyphenCssStyle = {} as HyphenCssStyle;
  const errors: Error[] = [];

  for (const property in data) {
    if (property === "__raw") {
      css = {
        ...css,
        ...data.__raw,
      };
      continue;
    }
    try {
      const value = data[property as StylePropertyName];
      processProperty({
        property,
        value,
        css,
        context,
      });
    } catch (e) {
      const error = new Error(`Error processing property "${property}"`);
      error.cause = e;
      errors.push(error);
      continue;
    }
  }

  return [stripUndefined(css), errors];
}
