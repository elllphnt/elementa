// Import needed types
import {
  AngleData,
  ColorData,
  DimensionData,
  DurationData,
  FlexData,
  LengthData,
  PercentData,
  RatioData,
  StyleDataType,
} from "../../../types/_primitives/style/datatypes.js";

// dimension
export function stringifyDimension<U extends string>(
  dimension: DimensionData<U>,
): string {
  if (dimension.unit === "vh") {
    return `calc(${dimension.value} * var(--vh-unit))`;
  } else if (dimension.unit === "vw") {
    return `calc(${dimension.value} * var(--vw-unit))`;
  } else {
    return `${dimension.value}${dimension.unit}`;
  }
}

// angle
export function stringifyAngle(angle: AngleData): string {
  return stringifyDimension(angle);
}

// length
export function stringifyLength(length: LengthData): string {
  return stringifyDimension(length);
}

// percent
export function stringifyPercent(percent: PercentData): string {
  return stringifyDimension(percent);
}

// duration
export function stringifyDuration(time: DurationData): string {
  return stringifyDimension(time);
}

// ratio
export function stringifyRatio(ratio: RatioData): string {
  return `${ratio[0]} / ${ratio[1]}`;
}

// color
export function stringifyColor(color: ColorData): string {
  switch (color.model) {
    case "rgb":
      return color.alpha !== undefined
        ? `rgb(${color.value.join(" ")} / ${color.alpha})`
        : `rgb(${color.value.join(" ")})`;
    case "hsl":
      return color.alpha !== undefined
        ? `hsl(${color.value.join(" ")} / ${color.alpha})`
        : `hsl(${color.value.join(" ")})`;
    case "hwb":
      return color.alpha !== undefined
        ? `hwb(${color.value.join(" ")} / ${color.alpha})`
        : `hwb(${color.value.join(" ")})`;
    case "lab":
      return color.alpha !== undefined
        ? `lab(${color.value.join(" ")} / ${color.alpha})`
        : `lab(${color.value.join(" ")})`;
    case "lch":
      return color.alpha !== undefined
        ? `lch(${color.value.join(" ")} / ${color.alpha})`
        : `lch(${color.value.join(" ")})`;
    case "oklab":
      return color.alpha !== undefined
        ? `oklab(${color.value.join(" ")} / ${color.alpha})`
        : `oklab(${color.value.join(" ")})`;
    case "oklch":
      return color.alpha !== undefined
        ? `oklch(${color.value.join(" ")} / ${color.alpha})`
        : `oklch(${color.value.join(" ")})`;
  }
}

// flex
export function stringifyFlex(flex: FlexData): string {
  return stringifyDimension(flex);
}

// primitive types
export function stringifyBoolean(bool: boolean): string {
  return bool.toString();
}

export function stringifyNumber(num: number): string {
  return num.toString();
}

export function stringifyString(str: string): string {
  return str;
}

export const styleDataStringifiers: Record<
  StyleDataType,
  (data: any) => string
> = {
  [StyleDataType.Boolean]: stringifyBoolean,
  [StyleDataType.Number]: stringifyNumber,
  [StyleDataType.String]: stringifyString,
  [StyleDataType.Angle]: stringifyAngle,
  [StyleDataType.Length]: stringifyLength,
  [StyleDataType.Percent]: stringifyPercent,
  [StyleDataType.Duration]: stringifyDuration,
  [StyleDataType.Ratio]: stringifyRatio,
  [StyleDataType.Color]: stringifyColor,
  [StyleDataType.Flex]: stringifyFlex,
};
