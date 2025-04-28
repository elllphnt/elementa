import { baseSelector, StyleSheetData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  CRDTModelMap,
  Extendable,
} from "@elllphnt/elementa-utils";
import { filter, map, Observable, tap } from "rxjs";
import * as y from "yjs";
import { Project } from "../project/project";
import { StyleModel, withStyleBehavior } from "./style";
import {
  StyleFragmentRegistryModel,
  withStyleFragmentRegistryBehavior,
} from "./style_fragment_registry";

export type StylesheetModel = ReturnType<
  typeof attachReactiveMap<StyleSheetData>
> & {
  project: Project;
  fragmentRegistry: StyleFragmentRegistryModel;
  styles: CRDTModelMap<y.Map<any>, StyleModel>;

  className: string;

  style<C extends true | undefined>(
    selector: string,
    create?: C
  ): C extends true ? StyleModel : StyleModel | undefined;
  style$<C extends true | undefined>(
    selector: string,
    create?: C
  ): C extends true
    ? Observable<StyleModel>
    : Observable<StyleModel | undefined>;

  get conditions(): Record<string, string>;
  get conditions$(): Observable<Record<string, string>>;

  condition(id: string): string | undefined;
  condition$(id: string): Observable<string | undefined>;

  get selectors(): string[];
  get selectors$(): Observable<string[]>;

  baseStyle<C extends true | undefined>(
    create?: C
  ): C extends true ? StyleModel : StyleModel | undefined;
  baseStyle$<C extends true | undefined>(
    create?: C
  ): C extends true
    ? Observable<StyleModel>
    : Observable<StyleModel | undefined>;

  addStyle(selector: string): void;
  removeStyle(selector: string): void;

  setCondition(id: string, expression: string): void;
  removeCondition(id: string): void;
};

/**
 * Attach Stylesheet behavior to a y.Map
 */
export function withStylesheetBehavior(
  ymap: y.Map<any>,
  project: Project
): StylesheetModel {
  const sheet = attachReactiveMap<StyleSheetData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<StylesheetModel>;

  sheet.project = project;
  sheet.fragmentRegistry = withStyleFragmentRegistryBehavior(
    sheet.getOrCreateArray("fragments")
  );

  sheet.styles = new CRDTModelMap(sheet.getOrCreateMap("styles"), (ymap) =>
    withStyleBehavior(ymap, project, sheet.fragmentRegistry)
  );

  Object.defineProperty(sheet, "className", {
    get() {
      return `elll-stylesheet-${sheet.key}`;
    },
  });

  sheet.style = function <C extends true | undefined>(
    selector: string,
    create?: C
  ) {
    let style = sheet.styles.item(selector);
    if (!style && create) {
      sheet.addStyle(selector);
      style = sheet.styles.item(selector);
    }
    return style as any;
  };

  sheet.style$ = function <C extends true | undefined>(
    selector: string,
    create?: C
  ) {
    return sheet.styles.item$(selector).pipe(
      tap((style) => {
        if (!style && create) {
          sheet.addStyle(selector);
        }
      }),
      filter((style) => !!style || !create)
    ) as any;
  };

  Object.defineProperty(sheet, "conditions", {
    get() {
      return sheet.value.conditions ?? {};
    },
  });

  sheet.conditions$ = sheet.observable$.pipe(map((v) => v.conditions ?? {}));

  sheet.condition = (id: string) => {
    return sheet.conditions[id];
  };

  sheet.condition$ = (id: string) => {
    return sheet.conditions$.pipe(map((conds) => conds[id]));
  };

  Object.defineProperty(sheet, "selectors", {
    get() {
      return Object.keys(sheet.styles.items);
    },
  });

  sheet.selectors$ = sheet.styles.items$.pipe(
    map((styles) => Object.keys(styles))
  );

  sheet.baseStyle = function <C extends true | undefined>(create?: C) {
    return sheet.style(baseSelector, create) as any;
  };

  sheet.baseStyle$ = function <C extends true | undefined>(create?: C) {
    return sheet.style$(baseSelector, create) as any;
  };

  sheet.addStyle = (selector: string) => {
    if (!sheet.styles.item(selector)) {
      sheet.styles.set(selector, new y.Map());
    }
  };

  sheet.removeStyle = (selector: string) => {
    if (sheet.styles.item(selector)) {
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

  return sheet as StylesheetModel;
}

/**
 * Create a new local Stylesheet
 */
export function createStylesheetModel(project: Project): StylesheetModel {
  const ymap = new y.Map<any>();
  return withStylesheetBehavior(ymap, project);
}
