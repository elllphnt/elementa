import { baseSelector, StyleSheetData } from "@elllphnt/elll-element";
import { combineLatestOrEmpty, CRDTModel } from "@repo/utils";
import { BehaviorSubject, map, Observable, switchMap } from "rxjs";
import { Project } from "~/src/project/_";
import { Style } from "./style";
import { StyleFragmentRegistry } from "./style_fragment_set";

/**
 * A standalone modelization of an Elll StylesheetData object.
 * Can be used to store and manipulate stylesheet data.
 */
export class Stylesheet extends CRDTModel<StyleSheetData> {
  readonly project: Project;
  readonly fragmentRegistry = new StyleFragmentRegistry();

  get className() {
    return `elll-stylesheet-${this.key}`;
  }

  get staticStyles$() {
    return this.styles$.pipe(
      map((styles) => {
        return Object.fromEntries(
          Object.entries(styles).filter(
            ([selector]) => !selector.startsWith("__expression:"),
          ),
        );
      }),
    );
  }
  get staticStyles() {
    return Object.fromEntries(
      Object.entries(this.styles).filter(
        ([selector]) => !selector.startsWith("__expression:"),
      ),
    );
  }

  get dynamicStyles$() {
    return this.styles$.pipe(
      map((styles) => {
        return Object.fromEntries(
          Object.entries(styles).filter(([selector]) =>
            selector.startsWith("__expression:"),
          ),
        );
      }),
    );
  }
  get dynamicStyles() {
    return Object.fromEntries(
      Object.entries(this.styles).filter(([selector]) =>
        selector.startsWith("__expression:"),
      ),
    );
  }

  style<C extends true | undefined>(
    selector: string,
    create?: C,
  ): C extends true ? Style : Style | undefined {
    let style = this.styles[selector];
    if (!style && create) {
      style = this.addStyle(selector);
    }
    return style;
  }
  style$<C extends true | undefined>(
    selector: string,
    create?: C,
  ): C extends true ? Observable<Style> : Observable<Style | undefined> {
    return this.styles$.pipe(
      map((styles) => {
        let style = styles[selector];
        if (!style && create) {
          style = this.addStyle(selector);
        }
        return style;
      }),
    );
  }

  get expressions$() {
    return this._expressions$;
  }
  get expressions() {
    return this._expressions$.value;
  }

  expression(id: string): string | undefined {
    return this.expressions[id];
  }
  expression$(id: string): Observable<string | undefined> {
    return this.expressions$.pipe(map((expressions) => expressions[id]));
  }

  get selectors() {
    return Object.keys(this.styles);
  }
  get selectors$() {
    return this.styles$.pipe(map((styles) => Object.keys(styles)));
  }

  baseStyle<C extends true | undefined>(
    create?: C,
  ): C extends true ? Style : Style | undefined {
    return this.style(baseSelector, create) as any;
  }
  baseStyle$<C extends true | undefined>(
    create?: C,
  ): C extends true ? Observable<Style> : Observable<Style | undefined> {
    return this.style$(baseSelector, create) as any;
  }

  get data(): StyleSheetData {
    return {
      styles: Object.fromEntries(
        Object.entries(this.styles).map(([selector, style]) => [
          selector,
          style.data,
        ]),
      ),
      fragments: this.fragmentRegistry.data,
      expressions: this.expressions,
    };
  }
  get data$(): Observable<StyleSheetData> {
    return combineLatestOrEmpty([
      this.styles$.pipe(
        switchMap((styles) =>
          combineLatestOrEmpty(
            Object.entries(styles).map(([selector, style]) =>
              style.data$.pipe(map((data) => [selector, data])),
            ),
          ),
        ),
        map((styles) => Object.fromEntries(styles)),
      ),
      this.fragmentRegistry.data$,
      this.expressions$,
    ]).pipe(
      map(([styles, styleFragments, expressions]) => ({
        styles,
        styleFragments,
        expressions,
      })),
    );
  }

  constructor({ project }: { project: Project }) {
    super();
    this.project = project;
    this.addDisposer(() => {
      Object.values(this.styles).forEach((style) => style.dispose());
      this._styles$.next({});
      this._styles$.complete();
    });
  }

  restore(data: StyleSheetData): void {
    restoreReactiveMap({
      datafiable$: this._styles$,
      data: data.styles,
      create: () =>
        new Style({
          project: this.project,
          fragmentRegistry: this.fragmentRegistry,
        }),
      restore: (style, styleData) => {
        style.restore(styleData);
      },
      dispose: (style) => {
        style.dispose();
      },
    });

    this.fragmentRegistry.restore(data.fragments || []);
    this._expressions$.next(data.expressions || {});
  }

  addStyle(selector: string) {
    const existing = this.styles[selector];
    if (existing) {
      return existing;
    }

    const style = new Style({
      project: this.project,
      fragmentRegistry: this.fragmentRegistry,
    });
    this._styles$.next({ ...this.styles, [selector]: style });

    return style;
  }

  setExpression(id: string, expression: string): void {
    const expressions = { ...this.expressions };
    expressions[id] = expression;
    this._expressions$.next(expressions);
  }

  removeStyle(selector: string): void {
    const existing = this.styles[selector];
    if (!existing) return;

    const styles = { ...this.styles };
    delete styles[selector];
    this._styles$.next(styles);
    existing.dispose();
  }
}
