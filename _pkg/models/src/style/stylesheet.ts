import { baseSelector, StyleSheetData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  createEnhancedReactiveMap,
  Extendable,
  getOrCreateYArray,
  getOrCreateYMap,
  ReactiveMap,
  setEnhancer,
  setModelFields,
} from "@elllphnt/elementa-utils";
import { filter, map, Observable, tap } from "rxjs";
import * as y from "yjs";
import { Project } from "../infrastructure/project/project";
import { attachStyle, createStyle, Style } from "./style";
import {
  attachStyleFragmentRegistry,
  StyleFragmentRegistry,
} from "./style_fragment_registry";

export type Stylesheet = ReactiveMap<StyleSheetData> & {
  project: Project;
  fragmentRegistry: StyleFragmentRegistry;
  styles: ReactiveMap<Record<string, Style>>;

  className: string;

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
};

/**
 * Attach Stylesheet behavior to a y.Map
 */
export function attachStylesheet(
  ymap: y.Map<any>,
  project: Project
): Stylesheet {
  const sheet = attachReactiveMap<StyleSheetData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<Stylesheet>;

  sheet.project = project;
  sheet.fragmentRegistry = attachStyleFragmentRegistry(
    getOrCreateYArray(sheet, "fragments")
  );

  sheet.styles = createEnhancedReactiveMap(
    getOrCreateYMap<y.Map<any>>(sheet, "styles"),
    attachStyle,
    (ymap) => attachStyle(ymap, project, sheet.fragmentRegistry)
  );

  setModelFields(sheet, ["conditions"]);

  sheet.style = function <C extends true | undefined>(
    selector: string,
    create?: C
  ) {
    let style = sheet.styles.get(selector);
    if (!style && create) {
      sheet.addStyle(selector);
      style = sheet.styles.get(selector);
    }
    return style as any;
  };

  sheet.style$ = function <C extends true | undefined>(
    selector: string,
    create?: C
  ) {
    return sheet.styles.observable$.pipe(
      map((styles) => styles[selector]),
      tap((style) => {
        if (!style && create) {
          sheet.addStyle(selector);
        }
      }),
      filter((style) => !!style || !create)
    ) as any;
  };

  sheet.condition = (id: string) => {
    return sheet.conditions[id];
  };

  sheet.condition$ = (id: string) => {
    return sheet.conditions$.pipe(map((conds) => conds[id]));
  };

  sheet.selectors$ = sheet.styles.observable$.pipe(
    map((styles) => Object.keys(styles))
  );

  sheet.baseStyle = function <C extends true | undefined>(create?: C) {
    return sheet.style(baseSelector, create) as any;
  };

  sheet.baseStyle$ = function <C extends true | undefined>(create?: C) {
    return sheet.style$(baseSelector, create) as any;
  };

  sheet.addStyle = (selector: string) => {
    if (!sheet.styles.get(selector)) {
      sheet.styles.set(selector, createStyle(project, sheet.fragmentRegistry));
    }
  };

  sheet.removeStyle = (selector: string) => {
    if (sheet.styles.get(selector)) {
      sheet.styles.delete(selector);
    }
  };

  sheet.setCondition = (id: string, expression: string) => {
    const conds = { ...sheet.conditions };
    conds[id] = expression;
    sheet.patch({ conditions: conds });
  };

  sheet.removeCondition = (id: string) => {
    const conds = { ...sheet.conditions };
    delete conds[id];
    sheet.patch({ conditions: conds });
  };

  const baseDispose = (sheet as any).dispose?.bind(sheet);
  sheet.dispose = () => {
    sheet.styles.dispose();
    sheet.fragmentRegistry.dispose();
    if (baseDispose) baseDispose();
  };

  setEnhancer(sheet, attachStylesheet);
  return sheet as Stylesheet;
}

/**
 * Create a new local Stylesheet
 */
export function createStylesheet(project: Project): Stylesheet {
  const ymap = new y.Map<any>();
  return attachStylesheet(ymap, project);
}
