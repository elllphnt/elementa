import { FractionData, LengthData, PercentData } from "@elllphnt/elll-element";
import _ from "lodash";

export function resolveCommonValue<T>(
  values: T[],
  equal: (a: T, b: T) => boolean = _.isEqual,
): T | typeof mixed {
  const firstValue = values[0];
  if (values.every((value) => equal(value, firstValue))) {
    return firstValue;
  }
  return mixed;
}

export const mixed = Symbol("mixed");
export type MixedType = typeof mixed;

export function lengthToPixels(
  length: LengthData | PercentData | FractionData | "unset" | undefined,
  axis: "x" | "y" = "x",
): number {
  if (!length || length === "unset") {
    return 0;
  }

  if (typeof length === "number") {
    return length;
  }

  switch (length.unit) {
    case "px":
      return length.value;
    case "em":
      return length.value * 16;
    case "rem":
      return length.value * 16;
    case "vh":
      return (length.value / 100) * window.innerHeight;
    case "vw":
      return (length.value / 100) * window.innerWidth;
    case "%":
      return (
        (length.value / 100) *
        (axis === "x" ? window.innerWidth : window.innerHeight)
      );
    default:
      return 0;
  }
}

export function lengthToUnit(
  length: LengthData | PercentData | FractionData,
  unit: string,
  axis: "x" | "y" = "x",
): LengthData | PercentData | FractionData {
  const pixelValue = lengthToPixels(length, "x");
  switch (unit) {
    case "px":
      return { value: pixelValue, unit: "px" };
    case "em":
      return { value: pixelValue / 16, unit: "em" };
    case "rem":
      return { value: pixelValue / 16, unit: "rem" };
    case "vh":
      return { value: (pixelValue / window.innerHeight) * 100, unit: "vh" };
    case "vw":
      return { value: (pixelValue / window.innerWidth) * 100, unit: "vw" };
    case "%":
      return {
        value:
          (pixelValue /
            (axis === "x" ? window.innerWidth : window.innerHeight)) *
          100,
        unit: "%",
      };
    default:
      return { value: 0, unit: "px" };
  }
}
