import {
  ColorSchemeDefinitionData,
  ColorSchemeSetData,
  StyleModifierData,
  StyleSystemData,
  ViewportDefinitionData,
  ViewportSetData,
} from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Project } from "~/project/_.js";
import { Identifiable } from "../_shared/_.js";

export interface ColorSchemeDefinition extends Identifiable {
  name: string | undefined;
  name$: Observable<string | undefined>;

  modifiers: StyleModifierData[] | undefined;
  modifiers$: Observable<StyleModifierData[] | undefined>;

  setName(name: string | undefined): void;
  setModifiers(modifiers: StyleModifierData[] | undefined): void;
}

export interface ColorSchemeSet {
  data: ColorSchemeSetData;
  data$: Observable<ColorSchemeSetData>;

  source: "system" | "definitions";
  source$: Observable<"system" | "definitions">;

  definitions: ColorSchemeDefinition[] | undefined;
  definitions$: Observable<ColorSchemeDefinition[] | undefined>;

  definition(id: string): ColorSchemeDefinition | undefined;
  definition$(id: string): Observable<ColorSchemeDefinition | undefined>;

  setSource(source: "system" | "definitions"): void;
  addDefinition(data: ColorSchemeDefinitionData): ColorSchemeDefinition;
  removeDefinition(id: string): void;
}

export interface ViewportDefinition extends Identifiable {
  name: string | undefined;
  name$: Observable<string | undefined>;

  width: [number | null, number | null] | undefined;
  width$: Observable<[number | null, number | null] | undefined>;

  height: [number | null, number | null] | undefined;
  height$: Observable<[number | null, number | null] | undefined>;

  ratio: [number | null, number | null] | undefined;
  ratio$: Observable<[number | null, number | null] | undefined>;

  modifiers: StyleModifierData[] | undefined;
  modifiers$: Observable<StyleModifierData[] | undefined>;

  setName(name: string | undefined): void;
  setWidth(width: [number | null, number | null] | undefined): void;
  setHeight(height: [number | null, number | null] | undefined): void;
  setRatio(ratio: [number | null, number | null] | undefined): void;
  setModifiers(modifiers: StyleModifierData[] | undefined): void;
}

export interface ViewportSet {
  data: ViewportSetData;
  data$: Observable<ViewportSetData>;

  source: "breakpoints" | "definitions";
  source$: Observable<"breakpoints" | "definitions">;

  breakpoints: Record<string, number> | undefined;
  breakpoints$: Observable<Record<string, number> | undefined>;

  definitions: ViewportDefinition[] | undefined;
  definitions$: Observable<ViewportDefinition[] | undefined>;

  definition(id: string): ViewportDefinition | undefined;
  definition$(id: string): Observable<ViewportDefinition | undefined>;

  breakpoint(name: string): number | undefined;
  breakpoint$(name: string): Observable<number | undefined>;

  setSource(source: "breakpoints" | "definitions"): void;
  setBreakpoint(name: string, value: number): void;
  removeBreakpoint(name: string): void;
  addDefinition(data: ViewportDefinitionData): ViewportDefinition;
  removeDefinition(id: string): void;
}

export interface StyleSystem {
  project: Project;
  colorSchemes: ColorSchemeSet;
  viewports: ViewportSet;

  data: StyleSystemData;
  data$: Observable<StyleSystemData>;

  stylesheets: string[];
  stylesheets$: Observable<string[]>;

  addStylesheet(id: string): void;
  removeStylesheet(id: string): void;
}
