import { baseControlMap, BaseControlType, ControlMap } from "@repo/components";
import { TypefaceControl } from "./datatypes/typeface/typeface";
import { FillControl } from "./properties/fill/fill";

export enum EditorOwnControlType {
  Fill = "fill",
  Typeface = "typeface",
}
export type EditorControlType = BaseControlType | EditorOwnControlType;

export const editorControlMap = {
  ...baseControlMap,
  [EditorOwnControlType.Fill]: FillControl,
  [EditorOwnControlType.Typeface]: TypefaceControl,
} satisfies ControlMap<EditorControlType>;

export type EditorControlMap = typeof editorControlMap;
