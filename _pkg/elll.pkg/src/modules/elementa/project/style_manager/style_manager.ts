// ----------------- IMPORTS -----------------
import {
  CssSelector,
  ElllSelectorData,
  elllSelectorToCssSelector,
  parseElllSelector,
  stringifyElllSelector,
  stringifyModifer,
  StyleModifierData,
  StyleModifierDefinitionData,
  StyleModifierType,
} from "@elllphnt/elll-element";
import { IFileDrive } from "@repo/backend";
import { CssStyleSheet } from "@repo/elementa-models";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, combineLatest, map, Observable } from "rxjs";
import { jsonModelConstructor } from "~/src/models/json";
import { IElll } from "~/src/types/elll";
import { SynchronizedModelFile } from "../file";
import { IElllStyleManager } from "./_types";
import { StyleModifierSheet } from "./style_modifiers/style_modifier_sheet";
import { StyleVariableSheet } from "./style_variables/variable_sheet";

// ----------------- CONSTANTS -----------------
export const elllSelectors = {
  invalid: "__elll_invalid_selector__",
} satisfies Record<string, string>;
export const elllSelectorData = {
  invalid: [{ name: "__elll_invalid_selector__" }],
} satisfies Record<string, ElllSelectorData>;
export const elllCssSelectors = {
  invalid: ["&.__elll_invalid_selector__"],
} satisfies Record<string, CssSelector>;

// ----------------- HELPER FUNCTIONS -----------------
export function modifierToString({
  modifier,
  modifierDefinitions,
}: {
  modifier: StyleModifierData;
  modifierDefinitions: Record<string, StyleModifierDefinitionData>;
}) {
  const [str, error] = stringifyModifer({
    modifier,
    getModifierDefinition: (name) => modifierDefinitions[name],
    stringifyData: (type, data) => `${data}`,
  });
  return error ? elllSelectors.invalid : str;
}

export function modifierToClassName({
  modifier,
  modifierDefinitions,
}: {
  modifier: StyleModifierData;
  modifierDefinitions: Record<string, StyleModifierDefinitionData>;
}) {
  return "elll-mod-" + modifierToString({ modifier, modifierDefinitions });
}

export function modifierFromBreakpoint({
  id,
  name,
  value,
}: {
  id: string;
  name: string;
  value: number;
}): StyleModifierDefinitionData {
  return {
    id,
    name,
    type: StyleModifierType.Context,
    selector: [`@media (min-width: ${value}px)`],
  };
}

export function viewportFromBreakpoint({
  name,
  value,
}: {
  name: string;
  value: number;
}): ViewportData {
  return {
    name,
    width: [value, null],
    modifiers: [{ name }],
  };
}

// ----------------- TYPE DEFINITIONS -----------------
export type ColorSchemeData = {
  name: string;
  modifiers: StyleModifierData[];
};
export type ViewportData = {
  name: string;
  width?: [number | null, number | null];
  height?: [number | null, number | null];
  ratio?: [number | null, number | null];
  modifiers: StyleModifierData[];
};
export type StyleSystemData = {
  breakpoints?: Record<string, number>;
  colorSchemes?: ColorSchemeData[];
  viewports?: ViewportData[];
};

// ----------------- VIEWPORT MATCHING FUNCTION -----------------
export function matchViewport({
  height,
  width,
  viewport,
}: {
  height?: number;
  width?: number;
  viewport: ViewportData;
}): boolean {
  // Check width boundaries
  if (width !== undefined && viewport.width) {
    const [minWidth, maxWidth] = viewport.width;
    if (minWidth !== null && width < minWidth) return false;
    if (maxWidth !== null && width > maxWidth) return false;
  }
  // Check height boundaries
  if (height !== undefined && viewport.height) {
    const [minHeight, maxHeight] = viewport.height;
    if (minHeight !== null && height < minHeight) return false;
    if (maxHeight !== null && height > maxHeight) return false;
  }
  // Check ratio boundaries if both dimensions are available
  if (width !== undefined && height !== undefined && viewport.ratio) {
    const [minRatio, maxRatio] = viewport.ratio;
    const actualRatio = width / height;
    if (minRatio !== null && actualRatio < minRatio) return false;
    if (maxRatio !== null && actualRatio > maxRatio) return false;
  }
  return true;
}

// ----------------- ELLL STYLE MANAGER CLASS -----------------
export class ElllStyleManager
  extends SynchronizedModelFile<StyleSystemData>
  implements IElllStyleManager
{
  // --- Instance Fields ---
  readonly variableSheet: StyleVariableSheet;
  readonly modifierSheet: StyleModifierSheet;

  private _colorSchemes$ = new BehaviorSubject<ColorSchemeData[]>([]);
  private _breakpoints$ = new BehaviorSubject<Record<string, number>>({});
  private _viewports$ = new BehaviorSubject<ViewportData[]>([]);
  private _breakointBasedViewports$ = new BehaviorSubject<ViewportData[]>([]);
  private _breakpointBasedModifiers$ = new BehaviorSubject<
    StyleModifierDefinitionData[]
  >([]);

  private _colorSchemeByName$ = new BehaviorSubject<
    Record<string, ColorSchemeData>
  >({});
  private _modifiersByName$ = new BehaviorSubject<
    Record<string, StyleModifierDefinitionData>
  >({});

  // --- Getters for Stylesheets and Data Streams ---
  get stylesheets(): CssStyleSheet[] {
    // ...existing code...
    return this.variableSheet.sets.map((set) => set.styleSheet);
  }
  get stylesheets$(): Observable<CssStyleSheet[]> {
    // ...existing code...
    return this.variableSheet.sets$.pipe(
      map((sets) => sets.map((set) => set.styleSheet)),
    );
  }
  get colorSchemes() {
    return this._colorSchemes$.value;
  }
  get colorSchemes$() {
    return this._colorSchemes$.asObservable();
  }
  get breakpoints() {
    // ...existing code...
    return this._breakpoints$.value;
  }
  get breakpoints$() {
    // ...existing code...
    return this._breakpoints$.asObservable();
  }
  get viewports() {
    return [...this._viewports$.value, ...this._breakointBasedViewports$.value];
  }
  get viewports$() {
    return combineLatest([
      this._viewports$,
      this._breakointBasedViewports$,
    ]).pipe(
      map(([viewports, breakpointBased]) => [...viewports, ...breakpointBased]),
    );
  }
  get modifiers() {
    return [
      ...this.modifierSheet.modifiers,
      ...this._breakpointBasedModifiers$.value,
    ];
  }
  get modifiers$() {
    return combineLatest([
      this.modifierSheet.modifiers$,
      this._breakpointBasedModifiers$,
    ]).pipe(
      map(([modifiers, breakpointBased]) => [...modifiers, ...breakpointBased]),
    );
  }
  get modifiersByName() {
    return this._modifiersByName$.value;
  }
  get modifiersByName$() {
    return this._modifiersByName$.asObservable();
  }

  // --- Selector Methods ---
  cssSelectorOf(selector: ElllSelectorData): CssSelector {
    const modifiers = this.modifiersByName;
    const [cssSelector, error] = elllSelectorToCssSelector({
      selector,
      getModifierDefinition: (name) => modifiers[name],
      stringifyData: (type, value) => `${value}`,
    });
    if (error) {
      console.error(error);
      return elllCssSelectors.invalid;
    }
    return cssSelector;
  }
  cssSelectorOf$(selector: ElllSelectorData): Observable<CssSelector> {
    return this.modifiersByName$.pipe(
      map((modifierDefinitions) => {
        const [selectors, error] = elllSelectorToCssSelector({
          selector,
          getModifierDefinition: (name) => modifierDefinitions[name],
          stringifyData: (type, value) => `${value}`,
        });
        if (error) {
          console.error(error);
          return elllCssSelectors.invalid;
        }
        return selectors;
      }),
    );
  }
  stringifyElllSelector(selector: ElllSelectorData): string {
    const modifiers = this.modifiersByName;
    const [elllSelector, error] = stringifyElllSelector({
      selector,
      getModifierDefinition: (name) => modifiers[name],
      stringifyData: (type, value) => `${value}`,
    });
    if (error) {
      console.error(error);
      return elllSelectors.invalid;
    }
    return elllSelector;
  }
  stringifyElllSelector$(modifiers: StyleModifierData[]): Observable<string> {
    return this.modifiersByName$.pipe(
      map((modifierDefinitions) => {
        const [elllSelector, error] = stringifyElllSelector({
          selector: modifiers,
          getModifierDefinition: (name) => modifierDefinitions[name],
          stringifyData: (type, value) => `${value}`,
        });
        if (error) {
          console.error(error);
          return elllSelectors.invalid;
        }
        return elllSelector;
      }),
    );
  }
  parseElllSelector(selector: string): ElllSelectorData {
    const modifiers = this.modifiersByName;
    const [parsedSelector, error] = parseElllSelector({
      selector,
      getModifierDefinition: (name) => modifiers[name],
      parseData: (type, data) => data,
    });
    if (error) {
      console.error(error);
      return elllSelectorData.invalid;
    }
    return parsedSelector;
  }
  parseElllSelector$(selector: string): Observable<ElllSelectorData> {
    return this.modifiersByName$.pipe(
      map((modifierDefinitions) => {
        const [parsedSelector, error] = parseElllSelector({
          selector,
          getModifierDefinition: (name) => modifierDefinitions[name],
          parseData: (type, data) => data,
        });
        if (error) {
          console.error(error);
          return elllSelectorData.invalid;
        }
        return parsedSelector;
      }),
    );
  }

  // --- Modifier Conversion Methods ---
  modifierToString(modifier: StyleModifierData): string {
    return modifierToString({
      modifier,
      modifierDefinitions: this.modifiersByName,
    });
  }
  modifierToString$(modifier: StyleModifierData): Observable<string> {
    return this.modifiersByName$.pipe(
      map((modifierDefinitions) =>
        modifierToString({ modifier, modifierDefinitions }),
      ),
    );
  }
  modifierToClassName(modifier: StyleModifierData): string {
    return modifierToClassName({
      modifier,
      modifierDefinitions: this.modifiersByName,
    });
  }
  modifierToClassName$(modifier: StyleModifierData): Observable<string> {
    return this.modifiersByName$.pipe(
      map((modifierDefinitions) =>
        modifierToClassName({ modifier, modifierDefinitions }),
      ),
    );
  }

  // --- Color Scheme Methods ---
  private colorScheme(name: string): ColorSchemeData {
    return this._colorSchemeByName$.value[name];
  }
  private colorScheme$(name: string): Observable<ColorSchemeData | undefined> {
    return this._colorSchemeByName$.pipe(map((schemes) => schemes[name]));
  }
  colorSchemeModifiers({
    colorScheme,
  }: {
    colorScheme: string;
  }): StyleModifierData[] {
    const scheme = this.colorScheme(colorScheme);
    return scheme ? scheme.modifiers : [];
  }
  colorSchemeModifiers$({
    colorScheme,
  }: {
    colorScheme: string;
  }): Observable<StyleModifierData[]> {
    return this.colorScheme$(colorScheme).pipe(
      map((scheme) => (scheme ? scheme.modifiers : [])),
    );
  }

  // --- Viewport Modifier Methods ---
  private _getViewportModifiers({
    width,
    height,
    viewports,
  }: {
    width: number;
    height: number;
    viewports: ViewportData[];
  }) {
    for (const viewport of [...viewports].reverse()) {
      if (matchViewport({ height, width, viewport })) {
        return viewport.modifiers;
      }
    }
    return [];
  }
  viewportModifiers$({
    width,
    height,
  }: {
    width: number;
    height: number;
  }): Observable<StyleModifierData[]> {
    return this.viewports$.pipe(
      map((viewports) =>
        this._getViewportModifiers({ width, height, viewports }),
      ),
    );
  }
  viewportModifiers({
    width,
    height,
  }: {
    width: number;
    height: number;
  }): StyleModifierData[] {
    return this._getViewportModifiers({
      width,
      height,
      viewports: this.viewports,
    });
  }

  // --- Data Getters ---
  get data(): StyleSystemData {
    return {
      colorSchemes: this.colorSchemes,
      viewports: this.viewports,
    };
  }
  get data$(): Observable<StyleSystemData> {
    return combineLatestOrEmpty([this.colorSchemes$, this.viewports$]).pipe(
      map(([colorSchemes, viewports]) => ({
        colorSchemes,
        viewports,
      })),
    );
  }
  get sourceData$(): Observable<StyleSystemData> {
    // ...existing code...
    return this._modelSourceData$.pipe(map((data) => data ?? {}));
  }

  // --- Constructor & Cleanup ---
  constructor({ elll, drive }: { elll: IElll; drive: IFileDrive }) {
    super({
      elll,
      drive,
      path: ".elll/style",
      model: jsonModelConstructor.name,
    });
    this.variableSheet = new StyleVariableSheet({ styleManager: this });
    this.modifierSheet = new StyleModifierSheet({ styleManager: this });

    const colorSchemeSubscription = this.colorSchemes$.subscribe((schemes) => {
      this._colorSchemeByName$.next(
        Object.fromEntries(schemes.map((scheme) => [scheme.name, scheme])),
      );
    });
    const breakpointSubscription = this.breakpoints$.subscribe(
      (breakpoints) => {
        this._breakpointBasedModifiers$.next(
          Object.entries(breakpoints).map(([name, value]) =>
            modifierFromBreakpoint({ id: name, name, value }),
          ),
        );
        this._breakointBasedViewports$.next(
          Object.entries(breakpoints).map(([name, value]) =>
            viewportFromBreakpoint({ name, value }),
          ),
        );
      },
    );
    const modifiersByNameSubscription = this.modifiers$.subscribe(
      (modifiers) => {
        const byName: Record<string, StyleModifierDefinitionData> = {};
        for (const modifier of modifiers) {
          byName[modifier.name] = modifier;
        }
        this._modifiersByName$.next(byName);
      },
    );

    this.watchData();
    this.addDisposer(() => {
      colorSchemeSubscription.unsubscribe();
      breakpointSubscription.unsubscribe();
      modifiersByNameSubscription.unsubscribe();

      this._breakpointBasedModifiers$.complete();
      this._breakointBasedViewports$.complete();
      this._modifiersByName$.complete();
      this._colorSchemeByName$.complete();
    });
  }

  // --- Restore Method ---
  restore(data: StyleSystemData): void {
    this._colorSchemes$.next(data.colorSchemes ?? []);
    this._viewports$.next(data.viewports ?? []);
    this._breakpoints$.next(data.breakpoints ?? {});
  }
}
