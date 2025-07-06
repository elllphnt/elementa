import type {
  AngleData,
  ColorData,
  LengthData,
  LengthOrPercentData,
} from "../../../_primitives/style/datatypes.js";
import type { Variable } from "../../../_primitives/style/variable.js";

export type BaseFilterData = {
  type: string;
  backdrop?: boolean;
};

export type BlurFilterData = BaseFilterData & {
  type: "blur";
  radius: Variable<LengthOrPercentData>;
};

export type BrightnessFilterData = BaseFilterData & {
  type: "brightness";
  amount: Variable<number>;
};

export type ContrastFilterData = BaseFilterData & {
  type: "contrast";
  amount: Variable<number>;
};

export type DropShadowFilterData = BaseFilterData & {
  type: "drop-shadow";
  offsetX: Variable<LengthData>;
  offsetY: Variable<LengthData>;
  standardDeviation?: Variable<LengthData>;
  color?: Variable<ColorData>;
};

export type BoxShadowFilterData = BaseFilterData & {
  type: "box-shadow";
  inset?: Variable<boolean>;
  offsetX: Variable<LengthData>;
  offsetY: Variable<LengthData>;
  blurRadius?: Variable<LengthData>;
  spreadRadius?: Variable<LengthData>;
  color?: Variable<ColorData>;
};

export type TextShadowFilterData = BaseFilterData & {
  type: "text-shadow";
  offsetX: Variable<LengthData>;
  offsetY: Variable<LengthData>;
  blurRadius?: Variable<LengthData>;
  color?: Variable<ColorData>;
};

export type GrayscaleFilterData = BaseFilterData & {
  type: "grayscale";
  amount: Variable<number>;
};

export type HueRotateFilterData = BaseFilterData & {
  type: "hue-rotate";
  angle: Variable<AngleData>;
};

export type InvertFilterData = BaseFilterData & {
  type: "invert";
  amount: Variable<number>;
};

export type OpacityFilterData = BaseFilterData & {
  type: "opacity";
  amount: Variable<number>;
};

export type SaturateFilterData = BaseFilterData & {
  type: "saturate";
  amount: Variable<number>;
};

export type SepiaFilterData = BaseFilterData & {
  type: "sepia";
  amount: Variable<number>;
};

export type FilterData =
  | BlurFilterData
  | BrightnessFilterData
  | ContrastFilterData
  | DropShadowFilterData
  | BoxShadowFilterData
  | TextShadowFilterData
  | GrayscaleFilterData
  | HueRotateFilterData
  | InvertFilterData
  | OpacityFilterData
  | SaturateFilterData
  | SepiaFilterData;
