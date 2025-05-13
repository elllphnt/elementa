import {
  CssSelector,
  ElllSelectorData,
  StyleDataData,
  StyleModifierData,
  StyleModifierDefinitionData,
  StyleSheetData,
  VarRef,
} from "@elllphnt/elementa-base";
import { elllSelectorToCssSelector } from "@elllphnt/elementa-css";
import { BehaviorSubject, Observable, of } from "rxjs";
import { CssStyleSheet, StylesheetCssStyleSheet } from "~/css/_.js";
import { StylesheetModel } from "~/models/_.js";
import { Project } from "../interfaces/_.js";
import { StyleManager } from "../interfaces/project/managers/style_manager.js";

export interface ViewportRangeData {
  width?: [number, number];
  height?: [number, number];
}

export interface InMemoryStyleManagerData {
  stylesheets: StyleSheetData[];
  variables: Record<string, StyleDataData>;
  modifiers: Record<string, StyleModifierData>;
  modifierDefinitions: Record<string, StyleModifierDefinitionData>;
  colorSchemes: Record<string, string[]>; // scheme -> modifier ids
  viewports: Record<string, ViewportRangeData>; // modifier id -> dimensions
}

export class InMemoryStyleManager implements StyleManager {
  readonly project: Project;

  private _stylesheets = new BehaviorSubject<CssStyleSheet[]>([]);
  private _stylesheetModelMap = new Map<CssStyleSheet, StylesheetModel>();
  private _variables = new Map<string, StyleDataData>();
  private _modifiers = new Map<string, StyleModifierData>();
  private _modifierDefinitions = new Map<string, StyleModifierDefinitionData>();
  private _colorSchemes = new Map<string, string[]>();
  private _viewports = new Map<string, ViewportRangeData>();

  get stylesheets(): CssStyleSheet[] {
    return this._stylesheets.getValue();
  }

  get stylesheets$(): Observable<CssStyleSheet[]> {
    return this._stylesheets.asObservable();
  }

  constructor({
    data,
    project,
  }: {
    data?: InMemoryStyleManagerData;
    project: Project;
  }) {
    this.project = project;
    if (data) {
      this.restore(data);
    }
  }

  varRefValue(varRef: VarRef): StyleDataData | undefined {
    const value = this._variables.get(varRef.__var);

    // If there's no value but there's a fallback, return the fallback
    if (!value && varRef.fallback !== undefined) {
      return varRef.fallback;
    }

    return value;
  }

  variableValue$(varRef: VarRef): Observable<StyleDataData | undefined> {
    return of(this.varRefValue(varRef));
  }

  colorSchemeModifiers({
    colorScheme,
  }: {
    colorScheme: string;
  }): StyleModifierData[] {
    const modifierIds = this._colorSchemes.get(colorScheme) || [];
    return modifierIds
      .map((id) => this._modifiers.get(id))
      .filter((m): m is StyleModifierData => !!m);
  }

  colorSchemeModifiers$({
    colorScheme,
  }: {
    colorScheme: string;
  }): Observable<StyleModifierData[]> {
    return of(this.colorSchemeModifiers({ colorScheme }));
  }

  viewportModifiers({
    height,
    width,
  }: {
    height?: number;
    width?: number;
  }): StyleModifierData[] {
    const result: StyleModifierData[] = [];

    this._viewports.forEach((range, modifierId) => {
      let matches = true;

      if (width !== undefined && range.width !== undefined) {
        // Check if width falls within the range
        matches =
          matches &&
          (range.width[0] === undefined || width >= range.width[0]) &&
          (range.width[1] === undefined || width <= range.width[1]);
      }

      if (height !== undefined && range.height !== undefined) {
        // Check if height falls within the range
        matches =
          matches &&
          (range.height[0] === undefined || height >= range.height[0]) &&
          (range.height[1] === undefined || height <= range.height[1]);
      }

      if (matches) {
        const modifier = this._modifiers.get(modifierId);
        if (modifier) result.push(modifier);
      }
    });

    return result;
  }

  viewportModifiers$({
    height,
    width,
  }: {
    height?: number;
    width?: number;
  }): Observable<StyleModifierData[]> {
    return of(this.viewportModifiers({ height, width }));
  }

  modifierToClassName(modifier: StyleModifierData): string {
    const definition = this._modifierDefinitions.get(modifier.name);
    if (definition) {
      return `mod-${definition.id || modifier.name}`;
    }
    return `mod-${modifier.name}`;
  }

  modifierToClassName$(modifier: StyleModifierData): Observable<string> {
    return of(this.modifierToClassName(modifier));
  }

  elllSelectorToCss(selector: ElllSelectorData): CssSelector {
    const [cssSelector, error] = elllSelectorToCssSelector({
      selector,
      getModifierDefinition: (name) => this._modifierDefinitions.get(name),
    });

    if (error || !cssSelector) {
      // Fallback to a simple class selector if there's an error
      return [`.${selector.map((m) => this.modifierToClassName(m)).join(".")}`];
    }

    return cssSelector;
  }

  elllSelectorToCss$(selector: ElllSelectorData): Observable<CssSelector> {
    return of(this.elllSelectorToCss(selector));
  }

  elllSelectorFromString(selector: string): StyleModifierData[] {
    // Convert a string like "bg-blue.text-white" to style modifiers
    const parts = selector.split(".");
    const result: StyleModifierData[] = [];

    for (const part of parts) {
      if (!part) continue;

      // Try to find by ID first
      let found = false;

      for (const [name, definition] of this._modifierDefinitions.entries()) {
        if (definition.id === part) {
          const modifier = this._modifiers.get(name);
          if (modifier) {
            result.push(modifier);
            found = true;
            break;
          }
        }
      }

      // If not found by ID, try by name
      if (!found) {
        const modifier = this._modifiers.get(part);
        if (modifier) result.push(modifier);
      }
    }

    return result;
  }

  elllSelectorFromString$(selector: string): Observable<StyleModifierData[]> {
    return of(this.elllSelectorFromString(selector));
  }

  addVariable(id: string, value: StyleDataData): void {
    this._variables.set(id, value);
  }

  addModifier(
    modifier: StyleModifierData,
    definition?: StyleModifierDefinitionData
  ): void {
    this._modifiers.set(modifier.name, modifier);

    if (definition) {
      this._modifierDefinitions.set(modifier.name, definition);
    }
  }

  addColorScheme(name: string, modifierIds: string[]): void {
    this._colorSchemes.set(name, modifierIds);
  }

  addViewport(modifierId: string, range: ViewportRangeData): void {
    this._viewports.set(modifierId, range);
  }

  // Methods for serialization and deserialization

  toJSON(): InMemoryStyleManagerData {
    return {
      variables: Object.fromEntries(this._variables.entries()),
      modifiers: Object.fromEntries(this._modifiers.entries()),
      modifierDefinitions: Object.fromEntries(
        this._modifierDefinitions.entries()
      ),
      colorSchemes: Object.fromEntries(this._colorSchemes.entries()),
      viewports: Object.fromEntries(this._viewports.entries()),
      stylesheets: this._stylesheets.value
        .map((sheet) => this._stylesheetModelMap.get(sheet)?.data)
        .filter(Boolean) as StyleSheetData[],
    };
  }

  restore(data: InMemoryStyleManagerData): void {
    this._variables = new Map(Object.entries(data.variables || {}));
    this._modifiers = new Map(Object.entries(data.modifiers || {}));
    this._modifierDefinitions = new Map(
      Object.entries(data.modifierDefinitions || {})
    );
    this._colorSchemes = new Map(Object.entries(data.colorSchemes || {}));
    this._viewports = new Map(Object.entries(data.viewports || {}));

    // Clear existing stylesheets
    this._stylesheetModelMap.forEach((sheet) => sheet.dispose());
    this._stylesheetModelMap.clear();

    // Create new stylesheets from the data
    const stylesheets: CssStyleSheet[] = [];

    for (const sheetData of data.stylesheets || []) {
      const sst = new StylesheetModel({
        init: sheetData,
        project: this.project,
      });
      const sheet = new StylesheetCssStyleSheet({
        target: `stylesheet`,
        stylesheet: sst,
      });
      this._stylesheetModelMap.set(sheet, sst);
      stylesheets.push(sheet);
    }

    this._stylesheets.next(stylesheets);
  }
}
