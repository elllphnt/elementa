import { CssSelector } from "@elllphnt/elll-element";
import { Observable } from "rxjs";

export abstract class StyleManager {
  abstract cssSelectorOf({
    layer,
    modifier,
    baseSelector,
  }: {
    layer?: string;
    modifier?: string;
    baseSelector: string;
  }): CssSelector;
  abstract cssSelectorOf$({
    layer,
    modifier,
    baseSelector,
  }: {
    layer?: string;
    modifier?: string;
    baseSelector: string;
  }): Observable<CssSelector>;
}
