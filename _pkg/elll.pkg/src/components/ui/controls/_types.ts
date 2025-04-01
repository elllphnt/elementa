import { baseControlMap, baseControlTypes, ControlMap } from "@repo/components";
import { FillControl } from "./_uncertain/fill/fill";
import { TypedControl } from "./schema";

export const elllControlTypes = {
  ...baseControlTypes,
  Fill: "fill",
  Typed: "typed",
} as const;
export type ElllControlType =
  (typeof elllControlTypes)[keyof typeof elllControlTypes];

export const elllControlMap = {
  ...baseControlMap,
  [elllControlTypes.Fill]: FillControl,
  [elllControlTypes.Typed]: TypedControl,
} satisfies ControlMap<ElllControlType>;

export type EditorControlMap = typeof elllControlMap;
