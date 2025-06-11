import { StyleModifierDefinitionData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Project } from "~/project/project.js";

export interface StyleModifierSheet {
  project: Project;

  modifiers: StyleModifierDefinitionData[];
  modifiers$: Observable<StyleModifierDefinitionData[]>;

  modifier(id: string): StyleModifierDefinitionData | undefined;
  modifier$(id: string): Observable<StyleModifierDefinitionData | undefined>;

  modifierByName(name: string): StyleModifierDefinitionData | undefined;
  modifierByName$(
    name: string
  ): Observable<StyleModifierDefinitionData | undefined>;

  addModifier(
    definition: StyleModifierDefinitionData
  ): StyleModifierDefinitionData;
  removeModifier(id: string): void;
}
