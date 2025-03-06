import { CssSelector } from "@elllphnt/elll-element";
import { File, IFileDrive, ResourceData } from "@repo/backend";
import { StyleManager } from "@repo/elementa-models";
import { Observable, of } from "rxjs";
import { IElll } from "~/src/types/elll";
import { IElllStyleManager } from "./_types";
import { StyleModifierSheet } from "./style_modifiers/style_modifier_sheet";
import { StyleVariableSheet } from "./style_variables/variable_sheet";

function styleSelectorToCssSelector({
  layer,
  modifier,
  baseSelector,
}: {
  layer?: string;
  modifier?: string;
  baseSelector: string;
}): CssSelector {
  const modifiers = modifier?.split(":") ?? [];
  let selector = baseSelector;

  for (const mod of modifiers) {
    if (mod === "hover") {
      selector += ":hover";
    }
  }

  return [layer, selector].filter(Boolean) as CssSelector;
}

export class ElllStyleManager
  extends StyleManager
  implements IElllStyleManager
{
  elll: IElll;
  drive: IFileDrive<File<ResourceData & { path: string; type: string }>>;

  readonly variableSheet: StyleVariableSheet;
  readonly modifierSheet: StyleModifierSheet;

  cssSelectorOf({
    layer,
    modifier,
    baseSelector,
  }: {
    layer?: string;
    modifier?: string;
    baseSelector: string;
  }): CssSelector {
    return styleSelectorToCssSelector({
      layer,
      modifier,
      baseSelector,
    });
  }
  cssSelectorOf$({
    layer,
    modifier,
    baseSelector,
  }: {
    layer?: string;
    modifier?: string;
    baseSelector: string;
  }): Observable<CssSelector> {
    return of(
      styleSelectorToCssSelector({
        layer,
        modifier,
        baseSelector,
      }),
    );
  }

  constructor({ elll, drive }: { elll: IElll; drive: IFileDrive }) {
    super();
    this.elll = elll;
    this.drive = drive;
    this.variableSheet = new StyleVariableSheet({ styleManager: this });
    this.modifierSheet = new StyleModifierSheet({ styleManager: this });
  }
}
