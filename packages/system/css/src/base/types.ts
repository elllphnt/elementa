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
