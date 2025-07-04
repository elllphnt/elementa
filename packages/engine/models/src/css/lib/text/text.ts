import type { Observable } from "rxjs";
import { CssStyleSheet } from "../stylesheet.js";
import { cssStyleSheetTypes } from "../types.js";

/**
 * A TextCssStyleSheet represents a CSS stylesheet that is composed of
 * a single text string. This text string is expected to be a valid CSS
 * stylesheet that can be applied to the DOM.
 *
 * The target property is the selector that will be used to apply the
 * stylesheet to the DOM.
 */
export class TextCssStyleSheet extends CssStyleSheet {
  readonly target: string;

  private _text: () => string;
  private _text$: () => Observable<string>;

  get text(): string {
    return this._text();
  }
  get text$(): Observable<string> {
    return this._text$();
  }

  constructor({
    target,
    text,
    text$,
  }: {
    target: string;
    text: () => string;
    text$: () => Observable<string>;
  }) {
    super({ type: cssStyleSheetTypes.text });
    this.target = target;
    this._text = text;
    this._text$ = text$;
  }
}
