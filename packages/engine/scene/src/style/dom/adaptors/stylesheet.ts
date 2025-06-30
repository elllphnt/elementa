import { Lifecycle } from "@elllphnt/elementa-kernel";
import { BehaviorSubject, map } from "rxjs";

export abstract class DomStyleSheetAdaptor extends Lifecycle {
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  readonly key = `${
    DomStyleSheetAdaptor.keySeed
  }-${DomStyleSheetAdaptor.key++}`;

  abstract get target(): string;

  private _htmlStyleElements$ = new BehaviorSubject<
    Map<Document, HTMLStyleElement>
  >(new Map());
  private _documentRefCounts = new Map<Document, number>();

  get htmlStyleElements() {
    return [...this._htmlStyleElements$.value.values()];
  }
  get htmlStyleElements$() {
    return this._htmlStyleElements$
      .asObservable()
      .pipe(map((map) => [...map.values()]));
  }

  get cssStyleSheets() {
    return this.htmlStyleElements
      .map((styleElement) => {
        return styleElement.sheet;
      })
      .filter(Boolean) as CSSStyleSheet[];
  }
  get cssStyleSheets$() {
    return this.htmlStyleElements$.pipe(
      map((styleElements) => {
        return styleElements
          .map((styleElement) => {
            return styleElement.sheet;
          })
          .filter(Boolean) as CSSStyleSheet[];
      })
    );
  }

  constructor() {
    super();

    this.addDisposer(() => {
      this.htmlStyleElements.forEach((styleElement) => {
        styleElement.remove();
      });
      this._htmlStyleElements$.next(new Map());
      this._htmlStyleElements$.complete();
    });
  }

  incrementRef(document: Document) {
    const count = this._documentRefCounts.get(document) ?? 0;
    this._documentRefCounts.set(document, count + 1);
    return this._documentRefCounts.get(document) ?? 0;
  }
  decrementRef(document: Document) {
    const count = this._documentRefCounts.get(document) ?? 0;
    this._documentRefCounts.set(document, Math.max(0, count - 1));
    return this._documentRefCounts.get(document) ?? 0;
  }
  getRefCount(document: Document) {
    return this._documentRefCounts.get(document) ?? 0;
  }

  useRef(document: Document) {
    let styleElement = this._htmlStyleElements$.value.get(document);
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.dataset["target"] = this.target;
      document.head.appendChild(styleElement);
      const newMap = new Map(this._htmlStyleElements$.value);
      newMap.set(document, styleElement);
      this._htmlStyleElements$.next(newMap);
      console.log(
        `Created new style element for target "${this.target}" in document`,
        document
      );
    }
    this.incrementRef(document);
  }
  clearRef(document: Document) {
    const styleElement = this._htmlStyleElements$.value.get(document);
    const count = this.decrementRef(document);
    if (styleElement && count <= 0) {
      styleElement.remove();
      const newMap = new Map(this._htmlStyleElements$.value);
      newMap.delete(document);
      this._htmlStyleElements$.next(newMap);
    }
  }
}
