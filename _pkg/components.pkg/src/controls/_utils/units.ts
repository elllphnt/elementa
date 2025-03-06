export type AngleUnit = "deg" | "rad" | "grad" | "turn";
export type FractionUnit = "fr";
export type LengthUnit = "px" | "em" | "rem" | "vw" | "vh";
export type PercentUnit = "%";

export const lengthUnits = [
  {
    label: "Pixel",
    unit: "px",
    step: 1,
    min: 0,
  },
  {
    label: "Font size",
    unit: "em",
    step: 0.05,
    min: 0,
  },
  {
    label: "Root font size",
    unit: "rem",
    step: 0.05,
    min: 0,
  },
  {
    label: "Viewport height",
    unit: "vh",
    step: 1,
    min: 0,
  },
  {
    label: "Viewport width",
    unit: "vw",
    step: 1,
    min: 0,
  },
] as const;

export const lengthKeywords = [
  {
    label: "Fit content",
    value: "fit-content",
  },
] as const;

export const percentUnits = [
  {
    label: "Percent",
    unit: "%",
  },
] as const;

export const fractionUnits = [
  {
    label: "Fill",
    unit: "fr",
  },
] as const;

export const angleUnits = [
  {
    label: "Degree",
    unit: "deg",
    step: 1,
  },
  {
    label: "Radian",
    unit: "rad",
    step: 0.01,
  },
  {
    label: "Gradient",
    unit: "grad",
    step: 1,
  },
  {
    label: "Turn",
    unit: "turn",
    step: 0.1,
  },
] as const;
