import { CssSelector } from "@elllphnt/elementa-base";
import * as CSS from "csstype";

export type HyphenCssStyle = {
  [key in keyof CSS.PropertiesHyphen]?: string;
} & {
  [key: string]: string;
};
export type CamelCssStyle = {
  [key in keyof CSS.Properties]?: string;
};

export type CssStyleData = {
  [key: string]: typeof key extends keyof CSS.PropertiesHyphen
    ? string
    : string | CssStyleData;
};

export function applySelectedCssStyle({
  target,
  selector,
  style,
}: {
  target: CssStyleData;
  selector: CssSelector;
  style: CssStyleData;
}) {
  let targetStyle = target;

  for (const key of selector) {
    if (!targetStyle[key]) {
      targetStyle[key] = {};
    }
    targetStyle = targetStyle[key] as CssStyleData;
  }

  for (const [property, value] of Object.entries(style)) {
    targetStyle[property] = value;
  }
}
