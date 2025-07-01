import { Lifecycle } from "@elllphnt/elementa-kernel";
import { BehaviorSubject, map } from "rxjs";
import { styleLogger } from "../../../loggers.js";

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

    styleLogger.debug("DomStyleSheetAdaptor created", {
      key: this.key,
    });

    this.addDisposer(() => {
      styleLogger.info("DomStyleSheetAdaptor disposing", {
        key: this.key,
        target: this.target,
        styleElementsToRemove: this.htmlStyleElements.length,
      });

      this.htmlStyleElements.forEach((styleElement) => {
        styleLogger.debug("Removing style element", {
          target: this.target,
          document: styleElement.ownerDocument?.title || "unknown",
        });
        styleElement.remove();
      });
      this._htmlStyleElements$.next(new Map());
      this._htmlStyleElements$.complete();
    });
  }

  incrementRef(document: Document) {
    const count = this._documentRefCounts.get(document) ?? 0;
    this._documentRefCounts.set(document, count + 1);
    const newCount = this._documentRefCounts.get(document) ?? 0;

    styleLogger.debug("Incremented document ref count", {
      target: this.target,
      document: document.title || "unknown",
      newCount,
    });

    return newCount;
  }
  decrementRef(document: Document) {
    const count = this._documentRefCounts.get(document) ?? 0;
    this._documentRefCounts.set(document, Math.max(0, count - 1));
    const newCount = this._documentRefCounts.get(document) ?? 0;

    styleLogger.debug("Decremented document ref count", {
      target: this.target,
      document: document.title || "unknown",
      newCount,
    });

    return newCount;
  }
  getRefCount(document: Document) {
    return this._documentRefCounts.get(document) ?? 0;
  }

  useRef(document: Document) {
    let styleElement = this._htmlStyleElements$.value.get(document);
    if (!styleElement) {
      styleLogger.info("Creating new style element", {
        target: this.target,
        document: document.title || "unknown",
      });

      styleElement = document.createElement("style");
      styleElement.dataset["target"] = this.target;
      document.head.appendChild(styleElement);
      const newMap = new Map(this._htmlStyleElements$.value);
      newMap.set(document, styleElement);
      this._htmlStyleElements$.next(newMap);

      styleLogger.debug("Style element created and added to document head", {
        target: this.target,
        document: document.title || "unknown",
      });
    }
    this.incrementRef(document);
  }
  clearRef(document: Document) {
    const styleElement = this._htmlStyleElements$.value.get(document);
    const count = this.decrementRef(document);

    if (styleElement && count <= 0) {
      styleLogger.info("Removing style element - no more references", {
        target: this.target,
        document: document.title || "unknown",
      });

      styleElement.remove();
      const newMap = new Map(this._htmlStyleElements$.value);
      newMap.delete(document);
      this._htmlStyleElements$.next(newMap);
    }
  }
}
