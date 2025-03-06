import { BaseControlType } from "@repo/components";
import {
  EditorControlType,
  EditorOwnControlType,
} from "../components/controls/control_map";

export enum Datatype {
  String = "string",
  Number = "number",
  Boolean = "boolean",
  Date = "date",
  Fill = "fill",
  Duration = "duration",
  Length = "length",
  Color = "color",
  Percent = "percent",
}

export const datatypeControlMap: Record<Datatype, EditorControlType> = {
  [Datatype.String]: BaseControlType.String,
  [Datatype.Number]: BaseControlType.Number,
  [Datatype.Boolean]: BaseControlType.Boolean,
  [Datatype.Date]: BaseControlType.DateTime,
  [Datatype.Fill]: EditorOwnControlType.Fill,
  [Datatype.Duration]: BaseControlType.Duration,
  [Datatype.Length]: BaseControlType.Length,
  [Datatype.Color]: BaseControlType.Color,
  [Datatype.Percent]: BaseControlType.Percent,
};

export const datatypeNames: Record<Datatype, string> = {
  [Datatype.String]: "String",
  [Datatype.Number]: "Number",
  [Datatype.Boolean]: "Boolean",
  [Datatype.Date]: "Date",
  [Datatype.Fill]: "Fill",
  [Datatype.Duration]: "Duration",
  [Datatype.Length]: "Length",
  [Datatype.Color]: "Color",
  [Datatype.Percent]: "Percent",
};
