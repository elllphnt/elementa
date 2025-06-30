import {
  RawStyleData,
  stylePropertyConfigMap,
  StylePropertyName,
} from "@elllphnt/elementa-base";
import { Style } from "@elllphnt/elementa-models";
import { combineLatest, map, Observable, of, switchMap } from "rxjs";
import { ElementaInstanceType, Instance } from "../instance.js";
import { StyleSheetInstance } from "./stylesheet.js";
import { assert } from "@elllphnt/elementa-lang-utils";

/**
 * Represents a runtime live wrapper around a Style.
 * Attached to a selector inside a StyleSheetInstance.
 */
export class StyleInstance extends Instance {
  readonly selector: string;
  readonly stylesheetInstance: StyleSheetInstance;

  get style(): Style {
    return this.stylesheetInstance.stylesheet.style(this.selector, true);
  }
  get style$(): Observable<Style> {
    return this.stylesheetInstance.stylesheet.style$(this.selector, true);
  }

  private _propertyConfig(property: StylePropertyName) {
    const config = stylePropertyConfigMap[property];
    assert(config, `Property ${property} is not a valid style property`);
    return config;
  }

  /** Return the inherited value from parent style instance, if any */
  inheritedPropertyValue<N extends StylePropertyName>(
    property: N
  ): RawStyleData[N] {
    const config = this._propertyConfig(property);
    if (config.inherit) {
      return this.parentStyleInstance?.style.resolvedPropertyValue(property);
    } else {
      return undefined;
    }
  }
  inheritedPropertyValue$<N extends StylePropertyName>(
    property: N
  ): Observable<RawStyleData[N]> {
    const config = this._propertyConfig(property);
    if (config.inherit && this.parentStyleInstance) {
      return this.parentStyleInstance.style$.pipe(
        switchMap((style) => style.resolvedPropertyValue$(property))
      );
    } else {
      return of(undefined);
    }
  }

  /** Return own resolved value, or fallback to inherited */
  resolvedPropertyValue<N extends StylePropertyName>(
    property: N
  ): RawStyleData[N] {
    const own = this.style.resolvedPropertyValue(property);
    if (own !== undefined) {
      return own;
    }
    return this.inheritedPropertyValue(property);
  }
  resolvedPropertyValue$<N extends StylePropertyName>(
    property: N
  ): Observable<RawStyleData[N]> {
    return this.style$.pipe(
      switchMap((style) => style.resolvedPropertyValue$(property)),
      switchMap((own) => {
        if (own !== undefined) {
          return of(own);
        }
        return this.inheritedPropertyValue$(property);
      })
    );
  }

  get diagnosticLevel(): number {
    return Math.max(
      this.ownDiagnosticLevel,
      this.parentStyleInstance?.diagnosticLevel ?? 0
    );
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.parentStyleInstance?.diagnosticLevel$ ?? of(0),
    ]).pipe(map(([own, parent]) => Math.max(own, parent)));
  }

  constructor({
    selector,
    stylesheet,
  }: {
    selector: string;
    stylesheet: StyleSheetInstance;
  }) {
    super({
      type: ElementaInstanceType.Style,
      runtime: stylesheet.runtime,
      parent: stylesheet,
    });

    this.selector = selector;
    this.stylesheetInstance = stylesheet;
  }

  get parentStyleInstance(): StyleInstance | undefined {
    return this.stylesheetInstance.parentStylesheetInstance?.style(
      this.selector
    );
  }
}
