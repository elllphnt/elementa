import { z } from "zod";

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

export type ColorData = z.infer<typeof colorSchema>;

// === Ratio ===

export type RatioData = z.infer<typeof ratioSchema>;

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

// Schemas

const dimensionSchema = <U extends string>(units: readonly U[]) =>
  z.object({
    value: z.number(),
    unit: z.enum(units as [U, ...U[]]),
  });

export const lengthSchema = dimensionSchema([
  "px",
  "em",
  "rem",
  "vh",
  "vw",
] as const);
export const percentSchema = dimensionSchema(["%"] as const);
export const flexSchema = dimensionSchema(["fr"] as const);
export const durationSchema = dimensionSchema(["s", "ms"] as const);
export const angleSchema = dimensionSchema([
  "deg",
  "rad",
  "grad",
  "turn",
] as const);

export const colorSchema = z.object({
  model: z.enum(["rgb", "hsl", "hwb", "lab", "lch", "oklab", "oklch"]),
  value: z.array(z.number()),
  alpha: z.number().optional(),
});

export const ratioSchema = z.tuple([z.number(), z.number()]);

export const styleDataTypeSchemas = {
  [StyleDataType.Boolean]: z.boolean(),
  [StyleDataType.Number]: z.number(),
  [StyleDataType.String]: z.string(),
  [StyleDataType.Angle]: angleSchema,
  [StyleDataType.Color]: colorSchema,
  [StyleDataType.Duration]: durationSchema,
  [StyleDataType.Flex]: flexSchema,
  [StyleDataType.Length]: lengthSchema,
  [StyleDataType.Percent]: percentSchema,
  [StyleDataType.Ratio]: ratioSchema,
} as const;
