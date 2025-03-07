import { CssSelector } from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import { map, Observable, switchMap } from "rxjs";
import { Style } from "~/src/style/style";
import { Stylesheet } from "~/src/style/stylesheet";
import { CssStyleRule } from "../../lib/rule/stylerule";

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
    return [this.layer, `.${this.style.className}`].filter(
      Boolean,
    ) as CssSelector;
  }
  get intrinsicSelector$(): Observable<CssSelector> {
    return this.style$.pipe(
      map(
        (style) =>
          [this.layer, `.${style.className}`].filter(Boolean) as CssSelector,
      ),
    );
  }

  get styleData() {
    return this.style.css;
  }
  get styleData$() {
    return this.style$.pipe(switchMap((style) => style.css$));
  }

  get modifiers() {
    return this.stylesheet.project.styleManager.modifiersFromElllSelector(
      this.selector,
    );
  }
  get modifiers$() {
    return this.stylesheet.project.styleManager.modifiersFromElllSelector$(
      this.selector,
    );
  }

  get selectors() {
    return [
      this.intrinsicSelector,
      this.stylesheet.project.styleManager.cssSelectorOf({
        layer: this.layer,
        baseSelector: `.${this.stylesheet.className}`,
        modifiers: this.modifiers,
      }),
    ];
  }
  get selectors$() {
    return combineLatestOrEmpty([
      this.intrinsicSelector$,
      this.modifiers$.pipe(
        switchMap((modifiers) =>
          this.stylesheet.project.styleManager.cssSelectorOf$({
            layer: this.layer,
            baseSelector: `.${this.stylesheet.className}`,
            modifiers,
          }),
        ),
      ),
    ]).pipe(map(([intrinsic, selector]) => [intrinsic, selector]));
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
