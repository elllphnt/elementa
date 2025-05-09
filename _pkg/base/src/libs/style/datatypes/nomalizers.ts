import { DurationData, LengthData, PercentData } from "../../../types/_.js";
import { StyleDataType } from "../../../types/_primitives/style/datatypes.js";
import { roundToDecimals } from "../../utils/number.js";

export function normalizeDuration(time: DurationData): DurationData {
  switch (time.unit) {
    case "s":
      return {
        value: roundToDecimals(time.value, 2),
        unit: time.unit,
      };
    case "ms":
      return {
        value: Math.round(time.value),
        unit: time.unit,
      };
    default:
      return {
        value: roundToDecimals(time.value, 2),
        unit: time.unit,
      };
  }
}

export function normalizeLength(length: LengthData): LengthData {
  switch (length.unit) {
    case "vh":
      return {
        value: roundToDecimals(length.value, 2),
        unit: length.unit,
      };
    case "vw":
      return {
        value: roundToDecimals(length.value, 2),
        unit: length.unit,
      };
    case "px":
      return {
        value: Math.round(length.value),
        unit: length.unit,
      };
    case "em":
      return {
        value: roundToDecimals(length.value, 2),
        unit: length.unit,
      };
    case "rem":
      return {
        value: roundToDecimals(length.value, 2),
        unit: length.unit,
      };
    default:
      return {
        value: roundToDecimals(length.value, 2),
        unit: length.unit,
      };
  }
}

export function normalizePercent(percent: PercentData): PercentData {
  return {
    value: roundToDecimals(percent.value, 2),
    unit: percent.unit,
  };
}

// Add styleDataNormalizers mapping with explicit Record type
export const styleDataNormalizers: Partial<
  Record<StyleDataType, (data: unknown) => unknown>
> = {
  [StyleDataType.Duration]: normalizeDuration,
  [StyleDataType.Length]: normalizeLength,
  [StyleDataType.Percent]: normalizePercent,
};
