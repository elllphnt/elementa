import { ColorData } from "@elllphnt/elll-element";
import tinycolor from "tinycolor2";

export function colorDataFromRgb(rgb: tinycolor.ColorFormats.RGBA): ColorData {
  return {
    model: "rgb",
    value: [rgb.r, rgb.g, rgb.b],
    alpha: rgb.a,
  };
}
export function colorDataToRgb(color: ColorData): tinycolor.ColorFormats.RGBA {
  if (color.model === "rgb") {
    return {
      r: color.value[0],
      g: color.value[1],
      b: color.value[2],
      a: color.alpha ?? 1,
    };
  } else {
    return {
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    };
  }
}
