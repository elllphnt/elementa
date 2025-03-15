import { StyleModifierDefinitionData } from "@elllphnt/elll-element";
import { Observable } from "rxjs";

export interface IStyleModifierSheet {
  modifiers: StyleModifierDefinitionData[];
  modifiers$: Observable<StyleModifierDefinitionData[]>;

  modifier(id: string): StyleModifierDefinitionData | undefined;
  modifier$(id: string): Observable<StyleModifierDefinitionData | undefined>;
}
