import React from "react";
import {
  BooleanControl,
  ColorControl,
  DateTimeControl,
  DimensionControl,
  DurationControl,
  ExpressionControl,
  FractionControl,
  LengthControl,
  NumberControl,
  PercentControl,
  ScriptControl,
  SelectControl,
  SpinnerControl,
  StringControl,
  SwitchControl,
  TextAreaControl,
  TextControl,
} from "./_";
import { ControlProps } from "./_type";
import { AngleControl } from "./datatypes/angle/angle";
import { SliderControl } from "./ui/slider/slider";

export type ControlMap<C extends string> = Record<
  C,
  React.ComponentType<ControlProps>
>;

export type ResolvedControlProps<
  M extends ControlMap<string>,
  T extends keyof M,
> = React.ComponentProps<M[T]>;

export const baseControlTypes = {
  // datatypes
  Angle: "angle",
  Boolean: "boolean",
  Color: "color",
  DateTime: "datetime",
  Dimension: "dimension",
  Duration: "duration",
  Expression: "expression",
  Fraction: "fraction",
  Length: "length",
  Number: "number",
  Percent: "percent",
  Script: "script",
  String: "string",

  // ui
  Select: "select",
  Spinner: "spinner",
  Switch: "switch",
  Text: "text",
  TextArea: "textarea",
  Slider: "slider",
} as const;

export type BaseControlType =
  (typeof baseControlTypes)[keyof typeof baseControlTypes];

export const baseControlMap = {
  [baseControlTypes.Angle]: AngleControl,
  [baseControlTypes.Boolean]: BooleanControl,
  [baseControlTypes.Color]: ColorControl,
  [baseControlTypes.DateTime]: DateTimeControl,
  [baseControlTypes.Dimension]: DimensionControl,
  [baseControlTypes.Duration]: DurationControl,
  [baseControlTypes.Expression]: ExpressionControl,
  [baseControlTypes.Fraction]: FractionControl,
  [baseControlTypes.Length]: LengthControl,
  [baseControlTypes.Number]: NumberControl,
  [baseControlTypes.Percent]: PercentControl,
  [baseControlTypes.Script]: ScriptControl,
  [baseControlTypes.String]: StringControl,
  [baseControlTypes.Select]: SelectControl,
  [baseControlTypes.Spinner]: SpinnerControl,
  [baseControlTypes.Switch]: SwitchControl,
  [baseControlTypes.Text]: TextControl,
  [baseControlTypes.TextArea]: TextAreaControl,
  [baseControlTypes.Slider]: SliderControl,
} satisfies ControlMap<BaseControlType>;
