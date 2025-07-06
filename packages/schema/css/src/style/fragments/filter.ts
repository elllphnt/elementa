import type {
  BlurFilterData,
  BoxShadowFilterData,
  BrightnessFilterData,
  ContrastFilterData,
  DropShadowFilterData,
  FilterData,
  GrayscaleFilterData,
  HueRotateFilterData,
  InvertFilterData,
  OpacityFilterData,
  SaturateFilterData,
  SepiaFilterData,
  TextShadowFilterData} from "@elllphnt/elementa-base";
import {
  StyleDataType
} from "@elllphnt/elementa-base";
import {
  variableFlexibleStyleDataToCss,
  variableStyleDataToCss,
} from "../variable.js";

export function blurFilterToCss(filter: BlurFilterData): string {
  return `blur(${variableFlexibleStyleDataToCss(
    filter.radius,
    StyleDataType.Length,
    StyleDataType.Percent
  )})`;
}

export function brightnessFilterToCss(filter: BrightnessFilterData): string {
  return `brightness(${variableStyleDataToCss(
    StyleDataType.Number,
    filter.amount
  )})`;
}

export function contrastFilterToCss(filter: ContrastFilterData): string {
  return `contrast(${variableStyleDataToCss(
    StyleDataType.Number,
    filter.amount
  )})`;
}

export function dropShadowFilterToCss(filter: DropShadowFilterData): string {
  const parts: string[] = [];

  if (filter.color) {
    parts.push(variableStyleDataToCss(StyleDataType.Color, filter.color));
  }
  parts.push(variableStyleDataToCss(StyleDataType.Length, filter.offsetX));
  parts.push(variableStyleDataToCss(StyleDataType.Length, filter.offsetY));
  if (filter.standardDeviation) {
    parts.push(
      variableFlexibleStyleDataToCss(
        filter.standardDeviation,
        StyleDataType.Length
      )
    );
  }

  return `drop-shadow(${parts.join(" ")})`;
}

export function boxShadowFilterToCss(filter: BoxShadowFilterData): string {
  const parts: string[] = [];

  if (filter.inset) {
    parts.push("inset");
  }
  parts.push(variableStyleDataToCss(StyleDataType.Length, filter.offsetX));
  parts.push(variableStyleDataToCss(StyleDataType.Length, filter.offsetY));
  if (filter.blurRadius && filter.spreadRadius) {
    parts.push(
      variableStyleDataToCss(StyleDataType.Length, filter.blurRadius),
      variableStyleDataToCss(StyleDataType.Length, filter.spreadRadius)
    );
  } else if (filter.spreadRadius) {
    parts.push(
      "0",
      variableStyleDataToCss(StyleDataType.Length, filter.spreadRadius)
    );
  } else if (filter.blurRadius) {
    parts.push(variableStyleDataToCss(StyleDataType.Length, filter.blurRadius));
  }
  if (filter.color) {
    parts.push(variableStyleDataToCss(StyleDataType.Color, filter.color));
  }

  return `${parts.join(" ")}`;
}

export function textShadowFilterToCss(filter: TextShadowFilterData): string {
  const parts: string[] = [];

  parts.push(variableStyleDataToCss(StyleDataType.Length, filter.offsetX));
  parts.push(variableStyleDataToCss(StyleDataType.Length, filter.offsetY));
  if (filter.blurRadius) {
    parts.push(variableStyleDataToCss(StyleDataType.Length, filter.blurRadius));
  }
  if (filter.color) {
    parts.push(variableStyleDataToCss(StyleDataType.Color, filter.color));
  }

  return `${parts.join(" ")}`;
}

export function grayscaleFilterToCss(filter: GrayscaleFilterData): string {
  return `grayscale(${variableStyleDataToCss(
    StyleDataType.Number,
    filter.amount
  )})`;
}

export function hueRotateFilterToCss(filter: HueRotateFilterData): string {
  return `hue-rotate(${variableStyleDataToCss(
    StyleDataType.Angle,
    filter.angle
  )})`;
}

export function invertFilterToCss(filter: InvertFilterData): string {
  return `invert(${variableStyleDataToCss(
    StyleDataType.Number,
    filter.amount
  )})`;
}

export function opacityFilterToCss(filter: OpacityFilterData): string {
  return `opacity(${variableStyleDataToCss(
    StyleDataType.Number,
    filter.amount
  )})`;
}

export function saturateFilterToCss(filter: SaturateFilterData): string {
  return `saturate(${variableStyleDataToCss(
    StyleDataType.Number,
    filter.amount
  )})`;
}

export function sepiaFilterToCss(filter: SepiaFilterData): string {
  return `sepia(${variableStyleDataToCss(
    StyleDataType.Number,
    filter.amount
  )})`;
}

export function filterToCss(filter: FilterData): string {
  switch (filter.type) {
    case "blur":
      return blurFilterToCss(filter as BlurFilterData);
    case "brightness":
      return brightnessFilterToCss(filter as BrightnessFilterData);
    case "contrast":
      return contrastFilterToCss(filter as ContrastFilterData);
    case "drop-shadow":
      return dropShadowFilterToCss(filter as DropShadowFilterData);
    case "box-shadow":
      return boxShadowFilterToCss(filter as BoxShadowFilterData);
    case "text-shadow":
      return textShadowFilterToCss(filter as TextShadowFilterData);
    case "grayscale":
      return grayscaleFilterToCss(filter as GrayscaleFilterData);
    case "hue-rotate":
      return hueRotateFilterToCss(filter as HueRotateFilterData);
    case "invert":
      return invertFilterToCss(filter as InvertFilterData);
    case "opacity":
      return opacityFilterToCss(filter as OpacityFilterData);
    case "saturate":
      return saturateFilterToCss(filter as SaturateFilterData);
    case "sepia":
      return sepiaFilterToCss(filter as SepiaFilterData);
  }
}
