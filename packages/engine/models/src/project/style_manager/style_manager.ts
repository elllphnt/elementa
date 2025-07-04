import type {
  CssSelector,
  ElllSelectorData,
  StyleDataData,
  StyleModifierData,
  StyleModifierDefinitionData,
  VarRef,
} from "@elllphnt/elementa-base";
import {
  parseElllSelector,
  stringifyStyleModifier,
} from "@elllphnt/elementa-base";
import { elllSelectorToCssSelector } from "@elllphnt/elementa-css";
import { Lifecycle, reconcileList } from "@elllphnt/elementa-kernel";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { Observable } from "rxjs";
import { BehaviorSubject, combineLatest, map, of, switchMap } from "rxjs";
import { StylesheetCssStyleSheet } from "~/css/stylesheets/stylesheet/stylesheet.js";
import type { Stylesheet } from "~/models/style/stylesheet/stylesheet.js";
import type { Project } from "../project.js";
import { generateClassName } from "./_utils.js";
import { ColorSchemeManager } from "./color_scheme.js";
import { ViewportManager } from "./viewport.js";

export function modifierToClassName({
  modifier,
  modifierDefinitions,
}: {
  modifier: StyleModifierData;
  modifierDefinitions: Record<string, StyleModifierDefinitionData>;
}) {
  const [str, err] = stringifyStyleModifier({
    modifier,
    getModifierDefinition: (name: string) => modifierDefinitions[name],
  });

  if (err) return "elll-mod-error";

  return "elll-mod-" + generateClassName(str);
}
export function elllSelectorToCss({
  selector,
  modifierDefinitions,
}: {
  selector: ElllSelectorData;
  modifierDefinitions: Record<string, StyleModifierDefinitionData>;
}): CssSelector {
  const [cssSelector, error] = elllSelectorToCssSelector({
    selector,
    getModifierDefinition: (name: string) => modifierDefinitions[name],
  });
  if (error) {
    console.error("Error converting elll selector to CSS:", error);
    return [];
  } else return cssSelector;
}
export function elllSelectorFromString({
  selector,
  modifierDefinitions,
}: {
  selector: string;
  modifierDefinitions: Record<string, StyleModifierDefinitionData>;
}): StyleModifierData[] {
  const [elllSelector, error] = parseElllSelector({
    selector,
    getModifierDefinition: (name: string) => modifierDefinitions[name],
  });
  if (error) {
    console.error("Error parsing elll selector:", error);
    return [];
  } else {
    return elllSelector;
  }
}

export class StyleManager extends Lifecycle {
  readonly project: Project;
  readonly colorSchemeManager: ColorSchemeManager;
  readonly viewportManager: ViewportManager;

  private _variableValues$ = new BehaviorSubject<
    Record<string, Record<string, StyleDataData>>
  >({});
  private _modifiersByName$ = new BehaviorSubject<
    Record<string, StyleModifierDefinitionData>
  >({});
  private _systemCssStylesheets = new BehaviorSubject<
    StylesheetCssStyleSheet[]
  >([]);

  // Stylesheets

  get styleSystem() {
    return this.project.styleSystem.model;
  }
  get styleSystem$() {
    return this.project.styleSystem.model$;
  }

  get systemStylesheets() {
    return (
      (this.styleSystem?.stylesheets
        .map((s) => s.model)
        .filter(Boolean) as Stylesheet[]) || []
    );
  }
  get systemStylesheets$() {
    return (
      this.styleSystem?.stylesheets$.pipe(
        switchMap((sheets) =>
          combineLatestOrEmpty(sheets.map((s) => s.model$))
        ),
        map((stylesheets) => stylesheets.filter(Boolean) as Stylesheet[])
      ) ?? of([])
    );
  }

  get cssStylesheets() {
    return this._systemCssStylesheets.value;
  }
  get cssStylesheets$() {
    return this._systemCssStylesheets.asObservable();
  }

  // Variable Values

  varRefValue(selector: string, varRef: VarRef): StyleDataData | undefined {
    const values = this._variableValues$.getValue();
    return values[selector]?.[varRef.__var];
  }
  varRefValue$(
    selector: string,
    varRef: VarRef
  ): Observable<StyleDataData | undefined> {
    return this._variableValues$.pipe(
      map((values) => values[selector]?.[varRef.__var])
    );
  }

  // Style Modifiers Definitions

  get modifierSheet() {
    return this.project.modifierSheet.model;
  }
  get modifierSheet$() {
    return this.project.modifierSheet.model$;
  }

  get modifierSheetModifiers() {
    return this.modifierSheet?.modifiers || [];
  }
  get modifierSheetModifiers$() {
    return (
      this.modifierSheet?.modifiers$.pipe(
        map((modifiers) => modifiers || [])
      ) ?? of([])
    );
  }

  get modifiers() {
    return [...this.modifierSheetModifiers];
  }
  get modifiers$() {
    return combineLatest([this.modifierSheetModifiers$]).pipe(
      map(([modifiers]) => [...modifiers])
    );
  }

  get modifiersByName() {
    return this._modifiersByName$.getValue();
  }
  get modifiersByName$() {
    return this._modifiersByName$.asObservable();
  }

  // Style Modifiers Data

  colorSchemeModifiers({
    colorScheme,
  }: {
    colorScheme: string;
  }): StyleModifierData[] {
    return this.colorSchemeManager.colorSchemeModifiers({ colorScheme });
  }
  colorSchemeModifiers$({
    colorScheme,
  }: {
    colorScheme: string;
  }): Observable<StyleModifierData[]> {
    return this.colorSchemeManager.colorSchemeModifiers$({ colorScheme });
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

  constructor({ project }: { project: Project }) {
    super();
    this.project = project;

    this.colorSchemeManager = new ColorSchemeManager({ project });
    this.viewportManager = new ViewportManager({ project });

    this.addInitializer(() => {
      this.colorSchemeManager.initialize();
      this.viewportManager.initialize();

      const modifiersByNameSubscription = this.modifiers$.subscribe(
        (modifiers) => {
          const newModifiersByName: Record<
            string,
            StyleModifierDefinitionData
          > = {};
          for (const modifier of modifiers) {
            newModifiersByName[modifier.name] = modifier;
          }
          this._modifiersByName$.next(newModifiersByName);
        }
      );
      const systemCssStylesheetsSubscription =
        this.systemStylesheets$.subscribe((stylesheets) => {
          const [nextStylesheets, removed] = reconcileList({
            sources: stylesheets,
            targets: this._systemCssStylesheets.value,
            sourceRef: (s) => s,
            targetRef: (s) => s.stylesheet,
            create: (stylesheet) =>
              new StylesheetCssStyleSheet({
                target: "style-system",
                stylesheet,
              }),
          });

          this._systemCssStylesheets.next(nextStylesheets);
          removed.forEach((r) => r.dispose());
        });

      this.addDisposer(() => {
        modifiersByNameSubscription.unsubscribe();
        systemCssStylesheetsSubscription.unsubscribe();

        this.colorSchemeManager.dispose();
        this.viewportManager.dispose();
      });
    });

    this.addDisposer(() => {
      this._variableValues$.complete();
      this._modifiersByName$.complete();
      this._systemCssStylesheets.complete();
      this.colorSchemeManager.dispose();
      this.viewportManager.dispose();
    });
  }

  modifierToClassName(modifier: StyleModifierData) {
    return modifierToClassName({
      modifier,
      modifierDefinitions: this.modifiersByName,
    });
  }
  modifierToClassName$(modifier: StyleModifierData): Observable<string> {
    return this.modifiersByName$.pipe(
      map((definitions) =>
        modifierToClassName({ modifier, modifierDefinitions: definitions })
      )
    );
  }

  elllSelectorToCss(selector: ElllSelectorData): CssSelector {
    return elllSelectorToCss({
      selector,
      modifierDefinitions: this.modifiersByName,
    });
  }
  elllSelectorToCss$(selector: ElllSelectorData): Observable<CssSelector> {
    return this.modifiersByName$.pipe(
      map((definitions) =>
        elllSelectorToCss({ selector, modifierDefinitions: definitions })
      )
    );
  }

  elllSelectorFromString(selector: string): StyleModifierData[] {
    return elllSelectorFromString({
      selector,
      modifierDefinitions: this.modifiersByName,
    });
  }
  elllSelectorFromString$(selector: string): Observable<StyleModifierData[]> {
    return this.modifiersByName$.pipe(
      map((definitions) =>
        elllSelectorFromString({ selector, modifierDefinitions: definitions })
      )
    );
  }
}
