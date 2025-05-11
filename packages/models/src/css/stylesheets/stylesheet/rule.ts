import { CssSelector } from "@elllphnt/elementa-base";
import { combineLatestOrEmpty } from "@elllphnt/elementa-utils";
import { combineLatest, map, Observable, switchMap } from "rxjs";
import { CssStyleRule } from "../../lib/rule/stylerule.js";
import { Style, Stylesheet } from "../../../models/_interfaces/_.js";

/**
 * An implementation of the `CssStyleRule` for a single style in a `Stylesheet` object.
 *
 * This class responsibility is to provide an adapation of the style in the `Stylesheet` object
 * to the interface expected by the `CssStyleRule` class. It ensures the string style selectors
 * get converted to the appropriate CSS selectors. and that the style CSS properties are correctly
 * extracted from the `Style` object.
 */
export class StylesheetCssStyleRule extends CssStyleRule {
  readonly layer?: string;
  readonly stylesheet: Stylesheet
  readonly selector: string;

  get style(): Style {
    return this.stylesheet.style(this.selector, true);
  }
  get style$(): Observable<Style> {
    return this.stylesheet.style$(this.selector, true);
  }

  get intrinsicSelector(): CssSelector {
    return [`@layer editor`, `.${this.style.className}.flag-selected`].filter(
      Boolean
    ) as CssSelector;
  }
  get intrinsicSelector$(): Observable<CssSelector> {
    return this.style$.pipe(
      map(
        (style) =>
          [`@layer editor`, `.${style.className}.flag-selected`].filter(
            Boolean
          ) as CssSelector
      )
    );
  }

  get styleData() {
    return this.style.css;
  }
  get styleData$() {
    return this.style$.pipe(switchMap((style) => style.css$));
  }

  get modifiers() {
    return this.stylesheet.project.styleManager.parseElllSelector(
      this.selector
    );
  }
  get modifiers$() {
    return this.stylesheet.project.styleManager.parseElllSelector$(
      this.selector
    );
  }

  get selectors() {
    return [
      // Use for direct style application
      this.intrinsicSelector,
      // Applied in stage
      [
        "@layer content",
        this.modifiers
          .map((modifier) =>
            this.stylesheet.project.styleManager.modifierToClassName(modifier)
          )
          .map((c) => `.${c}`)
          .join(" "),
        `.${this.stylesheet.className}`,
      ].filter(Boolean),
      // Applied in preview/production
      [
        "@layer content",
        ".elementa-preview",
        `.${this.stylesheet.className}`,
        ...this.stylesheet.project.styleManager.cssSelectorOf(this.modifiers),
      ],
    ];
  }
  get selectors$() {
    return combineLatestOrEmpty([
      // Use for direct style application
      this.intrinsicSelector$,
      // Applied in stage
      this.modifiers$.pipe(
        switchMap((modifiers) =>
          combineLatest(
            modifiers.map((modifier) =>
              this.stylesheet.project.styleManager.modifierToClassName$(
                modifier
              )
            )
          )
        ),
        map((classNames) =>
          [
            "@layer content",
            classNames.map((c) => `.${c}`).join(" "),
            `.${this.stylesheet.className}`,
          ].filter(Boolean)
        )
      ),
      // Applied in preview/production
      this.modifiers$.pipe(
        switchMap((modifiers) =>
          this.stylesheet.project.styleManager
            .cssSelectorOf$(modifiers)
            .pipe(
              map((selector) => [
                "@layer content",
                ".elementa-preview",
                `.${this.stylesheet.className}`,
                ...selector,
              ])
            )
        )
      ),
    ]).pipe(
      map(([intrinsic, stage, selector]) => [intrinsic, stage, selector])
    );
  }

  constructor({
    stylesheet,
    selector,
    layer,
  }: {
    stylesheet: Stylesheet;
    selector: string;
    layer?: string;
  }) {
    super();
    this.layer = layer;
    this.selector = selector;
    this.stylesheet = stylesheet;
  }
}
