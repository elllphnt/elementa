import { baseControlMap, BaseControlType, ControlMap } from "@repo/components";
import { FillControl } from "./properties/fill/fill";

export enum EditorOwnControlType {
  Fill = "fill",
}
export type EditorControlType = BaseControlType | EditorOwnControlType;

export const editorControlMap = {
  ...baseControlMap,
  [EditorOwnControlType.Fill]: FillControl,
} satisfies ControlMap<EditorControlType>;

export type EditorControlMap = typeof editorControlMap;
