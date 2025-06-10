import {
  StyleModifierData,
  StyleModifierDefinitionData,
  StyleModifierType,
} from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Project } from "~/project/project.js";
import { Identifiable } from "../_shared/_.js";

export interface StyleModifierDefinition extends Identifiable {
  name: string;
  name$: Observable<string>;

  type: StyleModifierType;
  type$: Observable<StyleModifierType>;

  signature?: StyleModifierData[];
  signature$: Observable<StyleModifierData[]>;

  precedence?: number;
  precedence$: Observable<number>;

  selector?: string[];
  selector$: Observable<string[]>;

  setName(name: string): void;
  setType(type: StyleModifierType): void;
  setSignature(signature: StyleModifierData[]): void;
  setPrecedence(precedence: number): void;
  setSelector(selector: string[]): void;
}

export interface StyleModifierSheet {
  project: Project;

  modifiers: StyleModifierDefinition[];
  modifiers$: Observable<StyleModifierDefinition[]>;

  modifier(id: string): StyleModifierDefinition | undefined;
  modifier$(id: string): Observable<StyleModifierDefinition | undefined>;

  modifierByName(name: string): StyleModifierDefinition | undefined;
  modifierByName$(
    name: string
  ): Observable<StyleModifierDefinition | undefined>;

  addModifier(definition: StyleModifierDefinitionData): StyleModifierDefinition;
  removeModifier(id: string): void;
}
