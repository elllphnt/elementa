import {
  AngleData,
  ColorData,
  LengthData,
  LengthOrFlexOrPercentData,
  LengthOrPercentData,
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
export type RawStyleData = UnsettableMap<{
  // position
  "position"?: PositionValue;
  "top"?: LengthData;
  "left"?: LengthData;
  "right"?: LengthData;
  "bottom"?: LengthData;

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
  "padding-top"?: LengthData;
  "padding-right"?: LengthData;
  "padding-bottom"?: LengthData;
  "padding-left"?: LengthData;

  // background
  "background-color"?: ColorData;
  "background-layers"?: string;

  // border
  "border-top-style"?: string;
  "border-top-width"?: number;
  "border-top-color"?: ColorData;
  "border-right-style"?: string;
  "border-right-width"?: number;
  "border-right-color"?: ColorData;
  "border-bottom-style"?: string;
  "border-bottom-width"?: number;
  "border-bottom-color"?: ColorData;
  "border-left-style"?: string;
  "border-left-width"?: number;
  "border-left-color"?: ColorData;

  // outline
  "outline-style"?: string;
  "outline-width"?: number;
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
  "letter-spacing"?: number;
  "text-overflow"?: string;
  "white-space"?: string;
  "word-break"?: string;
  "text-align"?: string;
  "line-height"?: number;

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
  "transition-duration"?: number;
  "transition-timing-function"?: string;
  "transition-delay"?: number;
}>;
