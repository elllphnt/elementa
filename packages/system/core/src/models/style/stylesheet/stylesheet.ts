import { Observable } from "rxjs";
import { Style } from "./style.js";
import { StyleFragmentRegistry } from "./style_fragment_registry.js";
import { Project } from "~/project/_.js";

export interface Stylesheet {
  project: Project;
  fragmentRegistry: StyleFragmentRegistry;

  className: string;

  styles: Record<string, Style>;
  styles$: Observable<Record<string, Style>>;

  style(selector: string): Style | undefined;
  style(selector: string, create: true): Style;
  style$(selector: string): Observable<Style | undefined>;
  style$(selector: string, create: true): Observable<Style>;

  conditions: Record<string, string> | undefined;
  conditions$: Observable<Record<string, string> | undefined>;

  condition(id: string): string | undefined;
  condition$(id: string): Observable<string | undefined>;

  selectors: string[];
  selectors$: Observable<string[]>;

  baseStyle(): Style | undefined;
  baseStyle(create: true): Style;
  baseStyle$(): Observable<Style | undefined>;
  baseStyle$(create: true): Observable<Style>;

  addStyle(selector: string): void;
  removeStyle(selector: string): void;

  setCondition(id: string, expression: string): void;
  removeCondition(id: string): void;
}
