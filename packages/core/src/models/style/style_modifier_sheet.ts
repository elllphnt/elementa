import { StyleModifierDefinitionData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Project } from "~/project/project.js";

export interface StyleModifierSheet {
  project: Project;

  modifiers: StyleModifierDefinitionData[];
  modifiers$: Observable<StyleModifierDefinitionData[]>;

  addModifier(definition: StyleModifierDefinitionData): void;
  removeModifier(id: string): void;
}
