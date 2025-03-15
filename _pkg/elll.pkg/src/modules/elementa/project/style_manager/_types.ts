import { StyleModifierDefinitionData } from "@elllphnt/elll-element";
import { IFileDrive } from "@repo/backend";
import { StyleManager } from "@repo/elementa-models";
import { Observable } from "rxjs";
import { IElll } from "~/src/types/elll";
import { IStyleModifierSheet } from "./style_modifiers/_types";
import { IStyleVariableSheet } from "./style_variables/_types";
import { ITypefaceSheet } from "./typefaces/_types";

export interface IElllStyleManager extends StyleManager {
  elll: IElll;
  drive: IFileDrive;
  variableSheet: IStyleVariableSheet;
  modifierSheet: IStyleModifierSheet;
  typefaceSheet: ITypefaceSheet;

  modifiersByName: Record<string, StyleModifierDefinitionData>;
  modifiersByName$: Observable<Record<string, StyleModifierDefinitionData>>;
}
