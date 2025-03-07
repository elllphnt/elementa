import {
  baseSelector,
  CssSelector,
  ErrorTupple,
  parseModifier,
  sortModifiers,
  stringifyModifer,
  StyleModifierData,
  StyleModifierDefinitionData,
  styleModifiersToCssSelector,
} from "@elllphnt/elll-element";
import { IFileDrive } from "@repo/backend";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, Observable } from "rxjs";
import { jsonModelConstructor } from "~/src/models/json";
import { IElll } from "~/src/types/elll";
import { SynchronizedModelFile } from "../file";
import { IElllStyleManager } from "./_types";
import { StyleModifierSheet } from "./style_modifiers/style_modifier_sheet";
import { StyleVariableSheet } from "./style_variables/variable_sheet";

export const elllModifiers = {
  invalid: {
    name: "__elll_invalid__",
  },
} satisfies Record<string, StyleModifierData>;
export const elllCssSelectors = {
  invalid: ({ layer, baseSelector }) => {
    if (layer) {
      return [baseSelector, `@layer ${layer}`, "&.__elll_invalid__"];
    } else {
      return [baseSelector, "&.__elll_invalid__"];
    }
  },
} satisfies Record<
  string,
  ({
    layer,
    baseSelector,
  }: {
    layer?: string;
    baseSelector: string;
  }) => CssSelector
>;

function modifiersToCssSelector({
  layer,
  modifiers = [],
  baseSelector,
  modifierDefinitions,
}: {
  layer?: string;
  modifiers?: StyleModifierData[];
  modifierDefinitions: Record<string, StyleModifierDefinitionData>;
  baseSelector: string;
}): ErrorTupple<CssSelector> {
  let selector = [baseSelector];

  if (layer) {
    selector = selector.concat(`@layer ${layer}`);
  }

  for (const modifier of modifiers) {
    const [modifierSelector, error] = styleModifiersToCssSelector({
      modifier,
      getModifierDefinition: (name) => modifierDefinitions[name],
      stringifyData: (type, value) => `${value}`,
    });
    if (error) return [undefined, error];
    selector = selector.concat(modifierSelector);
  }

  return [selector, undefined];
}
function modifiersToElllSelector({
  modifiers = [],
  modifierDefinitions,
}: {
  modifiers?: StyleModifierData[];
  modifierDefinitions: Record<string, StyleModifierDefinitionData>;
}): string {
  if (!modifiers.length) return baseSelector;
  return sortModifiers({
    modifiers,
    getModifierDefinition: (name) => modifierDefinitions[name],
  })
    .map((modifier) =>
      stringifyModifer({
        modifier,
        getModifierDefinition: (name) => modifierDefinitions[name],
        stringifyData: (type, value) => `${value}`,
      }),
    )
    .join(":");
}
function modifiersFromElllSelector({
  selector,
  modifierDefinitions,
}: {
  selector: string;
  modifierDefinitions: Record<string, StyleModifierDefinitionData>;
}): ErrorTupple<StyleModifierData[]> {
  if (selector === baseSelector) return [[], undefined];
  const parts = selector.split(":");
  const modifiers: StyleModifierData[] = [];

  for (const part of parts) {
    const [modifier, error] = parseModifier({
      modifier: part,
      getModifierDefinition: (name) => modifierDefinitions[name],
      parseData: (type, data) => data,
    });
    if (error) {
      return [undefined, error];
    }
    modifiers.push(modifier);
  }

  return [modifiers, undefined];
}

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
  colorSchemes?: ColorSchemeData[];
  viewports?: ViewportData[];
};

export function matchViewport({
  height,
  width,
  viewport,
}: {
  height?: number;
  width?: number;
  viewport: ViewportData;
}): boolean {
  // Check width boundaries if provided
  if (width !== undefined && viewport.width) {
    const [minWidth, maxWidth] = viewport.width;
    if (minWidth !== null && width < minWidth) return false;
    if (maxWidth !== null && width > maxWidth) return false;
  }
  // Check height boundaries if provided
  if (height !== undefined && viewport.height) {
    const [minHeight, maxHeight] = viewport.height;
    if (minHeight !== null && height < minHeight) return false;
    if (maxHeight !== null && height > maxHeight) return false;
  }
  // Optionally, check ratio boundaries if provided and both dimensions are available
  if (width !== undefined && height !== undefined && viewport.ratio) {
    const [minRatio, maxRatio] = viewport.ratio;
    const actualRatio = width / height;
    if (minRatio !== null && actualRatio < minRatio) return false;
    if (maxRatio !== null && actualRatio > maxRatio) return false;
  }
  return true;
}

export class ElllStyleManager
  extends SynchronizedModelFile<StyleSystemData>
  implements IElllStyleManager
{
  readonly variableSheet: StyleVariableSheet;
  readonly modifierSheet: StyleModifierSheet;

  private _colorSchemes$ = new BehaviorSubject<ColorSchemeData[]>([]);
  private _viewports$ = new BehaviorSubject<ViewportData[]>([]);
  private _colorSchemeByName$ = new BehaviorSubject<
    Record<string, ColorSchemeData>
  >({});

  cssSelectorOf({
    layer,
    modifiers,
    baseSelector,
  }: {
    layer?: string;
    modifiers?: StyleModifierData[];
    baseSelector: string;
  }): CssSelector {
    const [selectors, error] = modifiersToCssSelector({
      layer,
      modifiers,
      baseSelector,
      modifierDefinitions: this.modifierSheet.modifiersByName,
    });
    if (error) {
      console.error(error);
      return elllCssSelectors.invalid({ layer, baseSelector });
    } else {
      return selectors;
    }
  }
  cssSelectorOf$({
    layer,
    modifiers,
    baseSelector,
  }: {
    layer?: string;
    modifiers?: StyleModifierData[];
    baseSelector: string;
  }): Observable<CssSelector> {
    return this.modifierSheet.modifiersByName$.pipe(
      map((modifierDefinitions) => {
        const [selectors, error] = modifiersToCssSelector({
          layer,
          modifiers,
          baseSelector,
          modifierDefinitions,
        });
        if (error) {
          console.error(error);
          return elllCssSelectors.invalid({ layer, baseSelector });
        } else {
          return selectors;
        }
      }),
    );
  }

  get colorSchemes() {
    return this._colorSchemes$.value;
  }
  get colorSchemes$() {
    return this._colorSchemes$.asObservable();
  }

  get viewports() {
    return this._viewports$.value;
  }
  get viewports$() {
    return this._viewports$.asObservable();
  }

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

  private _getViewportModifiers({
    width,
    height,
    viewports,
  }: {
    width: number;
    height: number;
    viewports: ViewportData[];
  }) {
    for (const viewport of viewports) {
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

  modifiersToElllSelector(modifiers: StyleModifierData[]): string {
    return modifiersToElllSelector({
      modifiers,
      modifierDefinitions: this.modifierSheet.modifiersByName,
    });
  }
  modifiersToElllSelector$(modifiers: StyleModifierData[]): Observable<string> {
    return this.modifierSheet.modifiersByName$.pipe(
      map((modifierDefinitions) =>
        modifiersToElllSelector({ modifiers, modifierDefinitions }),
      ),
    );
  }

  modifiersFromElllSelector(selector: string): StyleModifierData[] {
    const [modifiers, error] = modifiersFromElllSelector({
      selector,
      modifierDefinitions: this.modifierSheet.modifiersByName,
    });
    if (error) {
      console.error(error);
      return [elllModifiers.invalid];
    }
    return modifiers;
  }
  modifiersFromElllSelector$(
    selector: string,
  ): Observable<StyleModifierData[]> {
    return this.modifierSheet.modifiersByName$.pipe(
      map((modifierDefinitions) => {
        const [modifiers, error] = modifiersFromElllSelector({
          selector,
          modifierDefinitions,
        });
        if (error) {
          console.error(error);
          return [elllModifiers.invalid];
        }
        return modifiers;
      }),
    );
  }

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
    return this._modelSourceData$.pipe(map((data) => data ?? {}));
  }

  constructor({ elll, drive }: { elll: IElll; drive: IFileDrive }) {
    super({
      elll,
      drive,
      path: ".elll/style",
      model: jsonModelConstructor.name,
    });
    this.variableSheet = new StyleVariableSheet({ styleManager: this });
    this.modifierSheet = new StyleModifierSheet({ styleManager: this });
  }

  restore(data: StyleSystemData): void {
    this._colorSchemes$.next(data.colorSchemes ?? []);
    this._viewports$.next(data.viewports ?? []);
  }
}
