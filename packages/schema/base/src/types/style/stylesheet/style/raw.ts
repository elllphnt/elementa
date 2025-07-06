import type {
  AngleData,
  ColorData,
  DurationData,
  LengthData,
  LengthOrFlexOrPercentData,
  LengthOrPercentData,
  PercentData,
  RatioData,
} from "../../../_primitives/style/datatypes.js";

export type CornerName =
  | "top-left"
  | "top-right"
  | "bottom-right"
  | "bottom-left";
export type EdgeName = "top" | "right" | "bottom" | "left";

export type LayoutValue = "flex" | "grid" | "none";
export type FlexDirectionValue = "row" | "column";
export type AlignItemsValue = "start" | "center" | "end" | "stretch";
export type JustifyItemsValue =
  | "start"
  | "center"
  | "end"
  | "space-between"
  | "space-around"
  | "space-evenly";
export type AlignContentValue =
  | "start"
  | "center"
  | "end"
  | "space-between"
  | "space-around"
  | "space-evenly";
export type JustifyContentValue = "start" | "center" | "end" | "stretch";
export type OverflowValue =
  | "visible"
  | "hidden"
  | "scroll-x"
  | "scroll-y"
  | "scroll-area";
export type BackgroundScaleValue = "cover" | "contain" | "auto";
export type FlexWrapValue = "wrap" | "nowrap";
export type PositionValue =
  | "static"
  | "absolute"
  | "relative"
  | "fixed"
  | "sticky";

export type UnsettableMap<T> = {
  [P in keyof T]: T[P] | "unset";
};

/**
 * A style data object that contains completely resolved values without any references.
 */
export type RawStyleData = {
  // position
  "position"?: PositionValue;
  "top"?: LengthOrPercentData;
  "left"?: LengthOrPercentData;
  "right"?: LengthOrPercentData;
  "bottom"?: LengthOrPercentData;

  // size
  "width"?: LengthOrFlexOrPercentData | "fit";
  "height"?: LengthOrFlexOrPercentData | "fit";
  "min-width"?: LengthOrPercentData;
  "min-height"?: LengthOrPercentData;
  "max-width"?: LengthOrPercentData;
  "max-height"?: LengthOrPercentData;
  "aspect-ratio"?: RatioData;

  // layout
  "display"?: LayoutValue;
  "align-items"?: AlignItemsValue;
  "justify-items"?: JustifyItemsValue;
  "align-content"?: AlignContentValue;
  "justify-content"?: JustifyContentValue;
  "overflow"?: OverflowValue;
  "z-index"?: number;

  // flex
  "flex-direction"?: FlexDirectionValue;
  "flex-wrap"?: FlexWrapValue;

  // grid
  "grid-template-columns"?: number;
  "grid-template-rows"?: number;
  "grid-column"?: number;
  "grid-row"?: number;
  "grid-auto-flow"?: string;

  // gap
  "gap-x"?: LengthData;
  "gap-y"?: LengthData;

  // padding
  "padding-top"?: LengthOrPercentData;
  "padding-right"?: LengthOrPercentData;
  "padding-bottom"?: LengthOrPercentData;
  "padding-left"?: LengthOrPercentData;

  // background
  "background-color"?: ColorData;
  "background-layers"?: string;

  // border
  "border-top-style"?: string;
  "border-top-width"?: LengthData;
  "border-top-color"?: ColorData;
  "border-right-style"?: string;
  "border-right-width"?: LengthData;
  "border-right-color"?: ColorData;
  "border-bottom-style"?: string;
  "border-bottom-width"?: LengthData;
  "border-bottom-color"?: ColorData;
  "border-left-style"?: string;
  "border-left-width"?: LengthData;
  "border-left-color"?: ColorData;

  // outline
  "outline-style"?: string;
  "outline-width"?: LengthData;
  "outline-color"?: ColorData;

  // border radius
  "border-top-left-radius"?: LengthData;
  "border-top-right-radius"?: LengthData;
  "border-bottom-right-radius"?: LengthData;
  "border-bottom-left-radius"?: LengthData;

  // text
  "font-family"?: string;
  "font-weight-style"?: string;
  "font-size"?: LengthData;
  "text-transform"?: string;
  "text-decoration"?: string;
  "letter-spacing"?: LengthData;
  "text-overflow"?: string;
  "white-space"?: string;
  "word-break"?: string;
  "text-align"?: string;
  "line-height"?: LengthData | PercentData;

  // transform
  "translate-x"?: LengthOrPercentData;
  "translate-y"?: LengthOrPercentData;
  "translate-z"?: LengthOrPercentData;
  "rotate-x"?: AngleData;
  "rotate-y"?: AngleData;
  "rotate-z"?: AngleData;
  "scale-x"?: number;
  "scale-y"?: number;
  "scale-z"?: number;
  "skew-x"?: AngleData;
  "skew-y"?: AngleData;

  // style
  "color"?: ColorData;
  "opacity"?: number;
  "visibility"?: string;
  "cursor"?: string;

  // filter
  "filters"?: string;

  // animation
  "animations"?: string;
  "transition-property"?: string;
  "transition-duration"?: DurationData;
  "transition-timing-function"?: string;
  "transition-delay"?: DurationData;
};
