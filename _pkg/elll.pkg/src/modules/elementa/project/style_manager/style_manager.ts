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
} from "@elllphnt/elll-element";
import { IFileDrive } from "@repo/backend";
import { CssStyleSheet } from "@repo/elementa-models";
import { BehaviorSubject, combineLatest, map, Observable } from "rxjs";
import { jsonModelConstructor } from "~/src/models/json";
import { IElll } from "~/src/types/elll";
import { SynchronizedModelFile } from "../file";
import { IElllStyleManager } from "./_types";
import { ColorSchemeData, ColorSchemeManager } from "./color_schemes";
import { StyleModifierSheet } from "./style_modifiers/style_modifier_sheet";
import { StyleVariableSheet } from "./style_variables/variable_sheet";
import { TypefaceSheet } from "./typefaces/typeface_sheet";
import { ViewportData, ViewportManager } from "./viewports";

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

// ----------------- TYPE DEFINITIONS -----------------
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
  readonly typefaceSheet: TypefaceSheet;
  readonly colorSchemeManager: ColorSchemeManager;
  readonly viewportManager: ViewportManager;

  private _modifiersByName$ = new BehaviorSubject<
    Record<string, StyleModifierDefinitionData>
  >({});

  get stylesheets(): CssStyleSheet[] {
    return [
      ...this.variableSheet.sets.map((set) => set.styleSheet),
      this.typefaceSheet.stylesheet,
    ];
  }
  get stylesheets$(): Observable<CssStyleSheet[]> {
    return combineLatest([
      this.variableSheet.sets$.pipe(
        map((sets) => sets.map((set) => set.styleSheet)),
      ),
    ]).pipe(
      map(([variableStylesheets]) => [
        ...variableStylesheets,
        this.typefaceSheet.stylesheet,
      ]),
    );
  }
  get modifiers() {
    return [...this.modifierSheet.modifiers, ...this.viewportManager.modifiers];
  }
  get modifiers$() {
    return combineLatest([
      this.modifierSheet.modifiers$,
      this.viewportManager.modifiers$,
    ]).pipe(
      map(([modifiers, viewportModifiers]) => [
        ...modifiers,
        ...viewportModifiers,
      ]),
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
    this.typefaceSheet = new TypefaceSheet({ styleManager: this });

    // Instantiate managers.
    this.colorSchemeManager = new ColorSchemeManager();
    this.viewportManager = new ViewportManager();

    const modifiersByNameSubscription = this.modifiers$.subscribe(
      (modifiers) => {
        const byName: Record<string, StyleModifierDefinitionData> = {};
        for (const modifier of modifiers) {
          if (modifier.name) {
            byName[modifier.name] = modifier;
          }
        }
        this._modifiersByName$.next(byName);
      },
    );

    this.watchData();
    this.addDisposer(() => {
      modifiersByNameSubscription.unsubscribe();
      this._modifiersByName$.complete();
    });
  }
  colorSchemeModifiers({
    colorScheme,
  }: {
    colorScheme: string;
  }): StyleModifierData[] {
    return this.colorSchemeManager.modifiers({ colorScheme });
  }
  colorSchemeModifiers$({
    colorScheme,
  }: {
    colorScheme: string;
  }): Observable<StyleModifierData[]> {
    return this.colorSchemeManager.modifiers$({ colorScheme });
  }
  viewportModifiers({
    height,
    width,
  }: {
    height?: number;
    width?: number;
  }): StyleModifierData[] {
    return this.viewportManager.viewportModifiers({ height, width });
  }
  viewportModifiers$({
    height,
    width,
  }: {
    height?: number;
    width?: number;
  }): Observable<StyleModifierData[]> {
    return this.viewportManager.viewportModifiers$({ height, width });
  }

  // --- Data Getters ---
  get data(): StyleSystemData {
    return {
      colorSchemes: this.colorSchemeManager.colorSchemes,
      viewports: this.viewportManager.viewports,
    };
  }
  get data$(): Observable<StyleSystemData> {
    return combineLatest([
      this.colorSchemeManager.colorSchemes$,
      this.viewportManager.viewports$,
    ]).pipe(
      map(([colorSchemes, viewports]) => ({
        colorSchemes,
        viewports,
      })),
    );
  }
  get sourceData$(): Observable<StyleSystemData> {
    return this._modelSourceData$.pipe(map((data) => data ?? {}));
  }

  // --- Restore Method ---
  restore(data: StyleSystemData): void {
    this.colorSchemeManager.restore(data.colorSchemes ?? []);
    this.viewportManager.restore(data.viewports ?? []);
  }
}
