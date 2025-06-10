import { TypefaceData, TypefaceDefinition } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Project } from "~/project/_.js";
import { Identifiable } from "../_shared/_.js";

export interface Typeface extends Identifiable {
  name: string;
  name$: Observable<string>;

  definition: TypefaceDefinition | undefined;
  definition$: Observable<TypefaceDefinition | undefined>;

  variants: string[];
  variants$: Observable<string[]>;

  setName(name: string): void;
  setDefinition(definition: TypefaceDefinition): void;
  setVariants(variants: string[]): void;
}

export interface TypefaceSheet {
  project: Project;

  typefaces: Typeface[];
  typefaces$: Observable<Typeface[]>;

  typeface(id: string): Typeface | undefined;
  typeface$(id: string): Observable<Typeface | undefined>;

  typefaceByName(name: string): Typeface | undefined;
  typefaceByName$(name: string): Observable<Typeface | undefined>;

  addTypeface(data: TypefaceData): Typeface;
  removeTypeface(id: string): void;
}
