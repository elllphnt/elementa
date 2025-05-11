import { Observable } from "rxjs";
import { Project } from "../../../infrastructure/_.js";
import { Style } from "./style.js";
import { StyleFragmentRegistry } from "./style_fragment_registry.js";

export interface Stylesheet {
  project: Project;
  fragmentRegistry: StyleFragmentRegistry;

  className: string;

  styles: Record<string, Style>;
  styles$: Observable<Record<string, Style>>;

  style<C extends true | undefined>(
    selector: string,
    create?: C
  ): C extends true ? Style : Style | undefined;

  style$<C extends true | undefined>(
    selector: string,
    create?: C
  ): C extends true ? Observable<Style> : Observable<Style | undefined>;

  conditions: Record<string, string>;
  conditions$: Observable<Record<string, string>>;

  condition(id: string): string | undefined;
  condition$(id: string): Observable<string | undefined>;

  selectors: string[];
  selectors$: Observable<string[]>;

  baseStyle<C extends true | undefined>(
    create?: C
  ): C extends true ? Style : Style | undefined;

  baseStyle$<C extends true | undefined>(
    create?: C
  ): C extends true ? Observable<Style> : Observable<Style | undefined>;

  addStyle(selector: string): void;
  removeStyle(selector: string): void;

  setCondition(id: string, expression: string): void;
  removeCondition(id: string): void;
}
