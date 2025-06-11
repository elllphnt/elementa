import {
  ColorSchemeDefinitionData,
  ViewportDefinitionData,
} from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { FileModelAdaptor, Project } from "~/project/_.js";

export interface ColorSchemeSet {
  source: "system" | "definitions";
  source$: Observable<"system" | "definitions">;

  definitions: ColorSchemeDefinitionData[];
  definitions$: Observable<ColorSchemeDefinitionData[]>;

  setSource(source: "system" | "definitions"): void;
  addDefinition(data: ColorSchemeDefinitionData): void;
  removeDefinition(index: number): void;
}

export interface ViewportSet {
  source: "breakpoints" | "definitions";
  source$: Observable<"breakpoints" | "definitions">;

  breakpoints: Record<string, number>;
  breakpoints$: Observable<Record<string, number>>;

  definitions: ViewportDefinitionData[];
  definitions$: Observable<ViewportDefinitionData[]>;

  breakpoint(name: string): number | undefined;
  breakpoint$(name: string): Observable<number | undefined>;

  setSource(source: "breakpoints" | "definitions"): void;
  setBreakpoint(name: string, value: number): void;
  removeBreakpoint(name: string): void;
  addDefinition(data: ViewportDefinitionData): void;
  removeDefinition(index: number): void;
}

export interface StyleSystem {
  project: Project;
  colorSchemes: ColorSchemeSet;
  viewports: ViewportSet;

  stylesheetUrls: string[];
  stylesheetUrls$: Observable<string[]>;

  stylesheets: FileModelAdaptor<"stylesheet">[];
  stylesheets$: Observable<FileModelAdaptor<"stylesheet">[]>;

  addStylesheet(url: string): void;
  removeStylesheet(url: string): void;
}
