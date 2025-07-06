import type { ErrorTupple } from "../../../types/_.js";
import type {
  AngleData,
  ColorData,
  DimensionData,
  DurationData,
  FlexData,
  LengthData,
  PercentData,
  RatioData} from "../../../types/_primitives/style/datatypes.js";
import {
  StyleDataType,
} from "../../../types/_primitives/style/datatypes.js";

export function parseDimension<U extends string>(
  input: string
): ErrorTupple<DimensionData<U>> {
  const match = input.trim().match(/^(-?\d*\.?\d+)([a-zA-Z%]+)$/);
  if (match) {
    return [{ value: parseFloat(match[1]), unit: match[2] as U }, undefined];
  }
  return [undefined, new Error("Invalid dimension format: " + input)];
}

// boolean
export function parseBoolean(input: string): ErrorTupple<boolean> {
  const trimmed = input.trim().toLowerCase();
  if (trimmed === "true") return [true, undefined];
  if (trimmed === "false") return [false, undefined];
  return [undefined, new Error("Invalid boolean: " + input)];
}

// number
export function parseNumber(input: string): ErrorTupple<number> {
  const value = parseFloat(input);
  if (isNaN(value)) return [undefined, new Error("Invalid number: " + input)];
  return [value, undefined];
}

// string
export function parseString(input: string): ErrorTupple<string> {
  return [input, undefined];
}

// angle
export function parseAngle(input: string): ErrorTupple<AngleData> {
  const [result, err] = parseDimension<"deg" | "rad" | "grad" | "turn">(input);
  if (err) return [undefined, err];
  return [result, undefined];
}

// length
export function parseLength(input: string): ErrorTupple<LengthData> {
  const [dimension, err] = parseDimension<"px" | "em" | "rem" | "vh" | "vw">(
    input
  );
  if (err) return [undefined, err];
  if (!["px", "em", "rem", "vh", "vw"].includes(dimension.unit)) {
    return [undefined, new Error("Invalid length unit: " + dimension.unit)];
  }
  return [dimension, undefined];
}

// percent
export function parsePercent(input: string): ErrorTupple<PercentData> {
  const [dimension, err] = parseDimension<"%">(input);
  if (err) return [undefined, err];
  if (dimension.unit !== "%") {
    return [undefined, new Error("Invalid percent unit: " + dimension.unit)];
  }
  return [dimension, undefined];
}

// duration
export function parseDuration(input: string): ErrorTupple<DurationData> {
  const [dimension, err] = parseDimension<"s" | "ms">(input);
  if (err) return [undefined, err];
  if (!["s", "ms"].includes(dimension.unit)) {
    return [undefined, new Error("Invalid duration unit: " + dimension.unit)];
  }
  return [dimension, undefined];
}

// flex
export function parseFlex(input: string): ErrorTupple<FlexData> {
  const [dimension, err] = parseDimension<"fr">(input);
  if (err) return [undefined, err];
  if (dimension.unit !== "fr") {
    return [undefined, new Error("Invalid flex unit: " + dimension.unit)];
  }
  return [dimension, undefined];
}

// ratio e.g. "16/9" or "16 / 9"
export function parseRatio(input: string): ErrorTupple<RatioData> {
  const parts = input.split("/").map((p) => p.trim());
  if (parts.length !== 2)
    return [undefined, new Error("Invalid ratio format: " + input)];
  const num = parseFloat(parts[0]);
  const den = parseFloat(parts[1]);
  if (isNaN(num) || isNaN(den))
    return [undefined, new Error("Invalid ratio numbers in: " + input)];
  return [[num, den], undefined];
}

// color
export function parseColor(input: string): ErrorTupple<ColorData> {
  const modelMatch = input.trim().match(/^(\w+)\((.*)\)$/);
  if (!modelMatch)
    return [undefined, new Error("Invalid color format: " + input)];
  const model = modelMatch[1] as ColorData["model"];
  const parts = modelMatch[2].split("/").map((part) => part.trim());
  const values = parts[0].split(/[ ,]+/).filter(Boolean).map(Number);
  const alpha = parts[1] ? parseFloat(parts[1]) : undefined;
  if (values.some(isNaN))
    return [undefined, new Error("Invalid color values: " + input)];
  return [{ model, value: values, alpha }, undefined];
}

export const styleDataParsers: Record<
  StyleDataType,
  (input: string) => ReturnType<typeof parseString> | any
> = {
  [StyleDataType.Boolean]: parseBoolean,
  [StyleDataType.Number]: parseNumber,
  [StyleDataType.String]: parseString,
  [StyleDataType.Angle]: parseAngle,
  [StyleDataType.Length]: parseLength,
  [StyleDataType.Percent]: parsePercent,
  [StyleDataType.Duration]: parseDuration,
  [StyleDataType.Flex]: parseFlex,
  [StyleDataType.Ratio]: parseRatio,
  [StyleDataType.Color]: parseColor,
};
