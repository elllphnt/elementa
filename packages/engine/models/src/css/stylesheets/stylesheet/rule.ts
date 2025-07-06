import type { CssSelector } from "@elllphnt/elementa-base";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { Observable } from "rxjs";
import { combineLatest, map, switchMap, tap } from "rxjs";
import type { Style } from "~/models/style/stylesheet/style.js";
import type { Stylesheet } from "~/models/style/stylesheet/stylesheet.js";
import { CssStyleRule } from "../../lib/rule/stylerule.js";

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
  readonly stylesheet: Stylesheet;
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
    return this.stylesheet.project.styleManager.elllSelectorFromString(
      this.selector
    );
  }
  get modifiers$() {
    return this.stylesheet.project.styleManager.elllSelectorFromString$(
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
        `.${this.stylesheet.className}`,
        this.modifiers
          .map((modifier) =>
            this.stylesheet.project.styleManager.modifierToClassName(modifier)
          )
          .map((c) => `.${c}`)
          .join(" "),
      ].filter(Boolean),
      // Applied in preview/production
      [
        "@layer content",
        ".elementa-root-preview",
        `.${this.stylesheet.className}`,
        ...this.stylesheet.project.styleManager.elllSelectorToCss(
          this.modifiers
        ),
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
            modifiers
              .map((modifier) =>
                this.stylesheet.project.styleManager.modifierToClassName$(
                  modifier
                )
              )
              .filter(Boolean)
          )
        ),
        map((classNames) =>
          [
            "@layer content",
            ".elementa-root-stage",
            `.${this.stylesheet.className}`,
            classNames.map((c) => `.${c}$`).join(" "),
          ].filter(Boolean)
        )
      ),
      // Applied in preview/production
      this.modifiers$.pipe(
        switchMap((modifiers) =>
          this.stylesheet.project.styleManager
            .elllSelectorToCss$(modifiers)
            .pipe(
              map((selector) => [
                "@layer content",
                ".elementa-root-preview",
                `.${this.stylesheet.className}`,
                ...selector,
              ])
            )
        )
      ),
    ]).pipe(
      map(([intrinsic, stage, selector]) => [intrinsic, stage, selector]),
      tap((selectors) => {
        console.log(
          "Selectors for StylesheetCssStyleRule:",
          this.stylesheet.className,
          selectors
        );
      })
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
