import { baseControlMap, baseControlTypes, ControlMap } from "@repo/components";
import { FillControl } from "./_uncertain/fill/fill";
import { SchemaControl } from "./schema";

export const elllControlTypes = {
  ...baseControlTypes,
  Fill: "fill",
  Schema: "schema",
} as const;
export type ElllControlType =
  (typeof elllControlTypes)[keyof typeof elllControlTypes];

export const elllControlMap = {
  ...baseControlMap,
  [elllControlTypes.Fill]: FillControl,
  [elllControlTypes.Schema]: SchemaControl,
} satisfies ControlMap<ElllControlType>;

export type EditorControlMap = typeof elllControlMap;
