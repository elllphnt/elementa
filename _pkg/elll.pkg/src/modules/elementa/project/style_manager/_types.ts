import { IFileDrive } from "@repo/backend";
import { StyleManager } from "@repo/elementa-models";
import { IElll } from "~/src/types/elll";
import { IStyleModifierSheet } from "./style_modifiers/_types";
import { IStyleVariableSheet } from "./style_variables/_types";

export interface IElllStyleManager extends StyleManager {
  elll: IElll;
  drive: IFileDrive;
  variableSheet: IStyleVariableSheet;
  modifierSheet: IStyleModifierSheet;
}
