// Types

export enum StyleDataType {
  Boolean = "boolean",
  Number = "number",
  String = "string",
  Angle = "angle",
  Color = "color",
  Duration = "duration",
  Flex = "flex",
  Length = "length",
  Percent = "percent",
  Ratio = "ratio",
}

// === Dimensions ===

export type DimensionData<U extends string> = {
  value: number;
  unit: U;
};

export type LengthData = DimensionData<"px" | "em" | "rem" | "vh" | "vw">;
export type PercentData = DimensionData<"%">;
export type FlexData = DimensionData<"fr">;
export type DurationData = DimensionData<"s" | "ms">;
export type AngleData = DimensionData<"deg" | "rad" | "grad" | "turn">;

export type LengthOrPercentData = LengthData | PercentData;
export type LengthOrFlexData = LengthData | FlexData;
export type LengthOrFlexOrPercentData = LengthData | PercentData | FlexData;
export type AngleOrPercentData = AngleData | PercentData;

// === Color ===

export type ColorData = {
  value: number[];
  model: "rgb" | "hsl" | "hwb" | "lab" | "lch" | "oklab" | "oklch";
  alpha?: number;
};

// === Ratio ===

export type RatioData = [number, number];

// === Map ===

export type StyleDataTypeMap = {
  [StyleDataType.Boolean]: boolean;
  [StyleDataType.Number]: number;
  [StyleDataType.String]: string;
  [StyleDataType.Angle]: AngleData;
  [StyleDataType.Color]: ColorData;
  [StyleDataType.Duration]: DurationData;
  [StyleDataType.Flex]: FlexData;
  [StyleDataType.Length]: LengthData;
  [StyleDataType.Percent]: PercentData;
  [StyleDataType.Ratio]: RatioData;
};

export type StyleDataData =
  | boolean
  | number
  | string
  | AngleData
  | ColorData
  | DurationData
  | FlexData
  | LengthData
  | PercentData
  | RatioData;
