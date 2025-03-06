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

export enum BaseControlType {
  // datatypes
  Angle = "angle",
  Boolean = "boolean",
  Color = "color",
  DateTime = "datetime",
  Dimension = "dimension",
  Duration = "duration",
  Expression = "expression",
  Fraction = "fraction",
  Length = "length",
  Number = "number",
  Percent = "percent",
  Script = "script",
  String = "string",

  // ui
  Select = "select",
  Spinner = "spinner",
  Switch = "switch",
  Text = "text",
  TextArea = "textarea",
  Slider = "slider",
}

export const baseControlMap = {
  [BaseControlType.Angle]: AngleControl,
  [BaseControlType.Boolean]: BooleanControl,
  [BaseControlType.Color]: ColorControl,
  [BaseControlType.DateTime]: DateTimeControl,
  [BaseControlType.Dimension]: DimensionControl,
  [BaseControlType.Duration]: DurationControl,
  [BaseControlType.Expression]: ExpressionControl,
  [BaseControlType.Fraction]: FractionControl,
  [BaseControlType.Length]: LengthControl,
  [BaseControlType.Number]: NumberControl,
  [BaseControlType.Percent]: PercentControl,
  [BaseControlType.Script]: ScriptControl,
  [BaseControlType.String]: StringControl,
  [BaseControlType.Select]: SelectControl,
  [BaseControlType.Spinner]: SpinnerControl,
  [BaseControlType.Switch]: SwitchControl,
  [BaseControlType.Text]: TextControl,
  [BaseControlType.TextArea]: TextAreaControl,
  [BaseControlType.Slider]: SliderControl,
} satisfies ControlMap<BaseControlType>;
