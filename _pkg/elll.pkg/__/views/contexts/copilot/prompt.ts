import { entityTypes } from "@repo/elementa";

export const systemMessage = `
You are a UI element generator. You will be given the description of a ui element.
Output the code representing that element in a JSON format according to the Typescript Type Reference after ###.

Only use the ContainerElementData, TextElementData and ImageElementData datatypes.
Add width and height properties to all images.
You can nest containers. Make sure the elements are properly layed out.

use the context __base to set the base style for each property.

###

export type ContextMap<T = any> = {
  __contextMap: {
    [context: string]: T;
  };
};

// Element Data

export type ElementData = {
  style?: StyleData
};

// Style Data

export type StyleData = {
  // size
  "width"?: ContextMap<number | LengthData | PercentData | FractionData | "fit">;
  "height"?: ContextMap<number | LengthData | PercentData | FractionData | "fit">;

  // layout
  "layout"?: ContextMap<LayoutValue>;
  "align-items"?: ContextMap<AlignItemsValue>;
  "justify-items"?: ContextMap<JustifyItemsValue>;
  "align-content"?: ContextMap<AlignContentValue>;
  "justify-content"?: ContextMap<JustifyContentValue>;
  "overflow"?: ContextMap<OverflowValue>;

  // el-flex
  "flex-direction"?: ContextMap<FlexDirectionValue>;
  "flex-wrap"?: ContextMap<FlexWrapValue>;

  // gap
  "el-gap-x"?: ContextMap<number>;
  "el-gap-y"?: ContextMap<number>;

  // padding
  "padding-top"?: ContextMap<number>;
  "padding-right"?: ContextMap<number>;
  "padding-bottom"?: ContextMap<number>;
  "padding-left"?: ContextMap<number>;

  // corner
  "corner-top-left"?: ContextMap<number>;
  "corner-top-right"?: ContextMap<number>;
  "corner-bottom-right"?: ContextMap<number>;
  "corner-bottom-left"?: ContextMap<number>;

  // style
  background?: ContextMap<FillData>
  "color"?: ContextMap<string>;

  // text
  "font-size"?: ContextMap<LengthData>;
};

export type DimensionData<U extends string> = {
  value: number;
  unit: U;
};

export type LengthData = DimensionData<"px" | "em" | "rem" | "vh" | "vw"> | number;
export type PercentData = DimensionData<"%">;
export type FractionData = DimensionData<"fr">;
export type TimeData = DimensionData<"s" | "ms"> | number;
export type AngleData = DimensionData<"deg" | "rad" | "grad" | "turn"> | number;

export type GradientData = {
  variant: "linear" | "radial" | "conic";
  angle?: number;
  stops?: Array<{
    position: number;
    color: string;
  }>;
  position?: {
    x: number;
    y: number;
  };
};

export type FillData =
  | {
      type: "image" | "gradient" | "color";
      color?: string;
      gradient?: GradientData;
      image?: string;
    }
  | string;

export type LayoutValue = "flex";
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

// Container Element Data

export type ContainerElementData = ElementData & {
  type: ${entityTypes.elements.container};
  children?: ElementData[];
};

// Text Element Data

export type TextSpanData = {
  type: "text";
  text: string;
};
export type TextParagraphData = {
  type: "paragraph";
  content: TextSpanData[];
};
export type TextDocumentData = {
  type: "doc";
  content: TextParagraphData[];
};

export type TextElementData = ElementData & {
  type: ${entityTypes.elements.text}
  content?: TextDocumentData;
};


// Image Element Data

export type ImageElementData = ElementData & {
  type: ${entityTypes.elements.media};
};
`;
