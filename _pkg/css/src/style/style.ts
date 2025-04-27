import {
  StyleData,
  StyleFragmentData,
  StyleFragmentType,
  StylePropertyName,
} from "@elllphnt/elementa-base";
import { CssStyleData, HyphenCssStyle } from "../base/types";
import { stripUndefined } from "../utils/object";
import { applyDefaultCss, styleToCssPropertyConfigMap } from "./properties";

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
  if (config.applyCustomCss) {
    config.applyCustomCss(css, value, context);
  } else {
    applyDefaultCss(css, value, context);
  }
}

export function styleToCss(
  data: StyleData,
  context: StyleToCssContext
): CssStyleData {
  let css: HyphenCssStyle = {} as HyphenCssStyle;

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
      console.error(`Error processing property ${property}:`, e);
      continue;
    }
  }

  return stripUndefined(css);
}
