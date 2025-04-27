import {
  AngleData,
  ColorData,
  LengthOrPercentData,
  PercentData,
} from "../../../_primitives/style/datatypes.js";
import { Variable } from "../../../_primitives/style/variable.js";

export type LinearGradientStopData = {
  position: PercentData;
  color: Variable<ColorData>;
};
export type AngularGradientStopData = {
  angle: AngleData;
  color: Variable<ColorData>;
};

export type BaseGradientData = {
  type?: string;
  repeat?: boolean;
};
export type LinearGradientData = BaseGradientData & {
  type?: "linear";
  angle?: Variable<AngleData>;
  stops?: Array<LinearGradientStopData>;
};
export type RadialGradientData = BaseGradientData & {
  type?: "radial";
  shape?: Variable<"ellipse" | "circle">;
  size?: Variable<LengthOrPercentData>;
  position?: {
    x: Variable<LengthOrPercentData>;
    y: Variable<LengthOrPercentData>;
  };
  stops: Array<LinearGradientStopData>;
};
export type ConicGradientData = BaseGradientData & {
  type?: "conic";
  angle?: Variable<AngleData>;
  position?: {
    x: Variable<LengthOrPercentData>;
    y: Variable<LengthOrPercentData>;
  };
  stops?: AngularGradientStopData[];
};
export type GradientData =
  | LinearGradientData
  | RadialGradientData
  | ConicGradientData;

export type BaseBackgroundLayerData = {
  type?: string;
};
export type GradientBackgroundLayerData = BaseBackgroundLayerData & {
  type?: "gradient";
  gradient?: GradientData;
};
export type ImageBackgroundLayerData = BaseBackgroundLayerData & {
  type?: "image";
  url?: Variable<string>;
  position?: {
    x: Variable<LengthOrPercentData>;
    y: Variable<LengthOrPercentData>;
  };
  size?: Variable<"auto" | "cover" | "contain" | LengthOrPercentData>;
  repeat?: Variable<"repeat" | "repeat-x" | "repeat-y" | "no-repeat">;
  clip?: Variable<"border-box" | "padding-box" | "content-box">;
  origin?: Variable<"border-box" | "padding-box" | "content-box">;
  attachment?: Variable<"scroll" | "fixed" | "local">;
};
export type BackgroundLayerData =
  | GradientBackgroundLayerData
  | ImageBackgroundLayerData;
