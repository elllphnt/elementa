import { baseSelector, StyleData } from "@elllphnt/elll-element";
import { combineLatestOrEmpty, Disposable } from "@repo/utils";
import { BehaviorSubject, map, Observable, switchMap } from "rxjs";
import { Datafiable, restoreReactiveMap } from "~/src/_lib/restore";
import { Project } from "~/src/project/_";
import { Style } from "./style";

export type StylesheetData = {
  styles?: Record<string, StyleData>;
};

/**
 * A standalone modelization of an Elll StylesheetData object.
 * Can be used to store and manipulate stylesheet data.
 */
export class Stylesheet
  extends Disposable
  implements Datafiable<StylesheetData>
{
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  readonly key = `${Stylesheet.keySeed}-${Stylesheet.key++}`;
  readonly project: Project;

  private _styles$ = new BehaviorSubject<Record<string, Style>>({});
  private _activeSelector$ = new BehaviorSubject<string | undefined>(undefined);

  get className() {
    return `elll-stylesheet-${this.key}`;
  }

  get styles$() {
    return this._styles$;
  }
  get styles() {
    return this._styles$.value;
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

  get activeSelector() {
    return this._activeSelector$.value;
  }
  get activeSelector$() {
    return this._activeSelector$.asObservable();
  }

  get derivedActiveSelectors() {
    return this.activeSelector
      ? this.selectors.filter((selector) =>
          this.activeSelector?.includes(selector),
        )
      : [];
  }
  get derivedActiveSelectors$() {
    return combineLatestOrEmpty([this.activeSelector$, this.selectors$]).pipe(
      map(([active, selectors]) =>
        active
          ? selectors.filter((selector) => active?.includes(selector))
          : [],
      ),
    );
  }

  get derivedActiveStyles() {
    return this.derivedActiveSelectors.map((selector) =>
      this.style(selector, true),
    );
  }
  get derivedActiveStyles$(){
    return this.derivedActiveSelectors$.pipe(
      switchMap(selectors=> combineLatestOrEmpty(
        selectors.map(selector => this.style$(selector, true))
      ))
    )
  }

  get data() {
    return {
      styles: Object.fromEntries(
        Object.entries(this.styles).map(([selector, style]) => [
          selector,
          style.data,
        ]),
      ),
    };
  }
  get data$() {
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
    ]).pipe(
      map(([styles]) => ({
        styles,
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

  restore(data: StylesheetData): void {
    restoreReactiveMap({
      datafiable$: this._styles$,
      data: data.styles,
      create: () => new Style({ project: this.project }),
      restore: (style, styleData) => {
        style.restore(styleData);
      },
      dispose: (style) => {
        style.dispose();
      },
    });
  }

  addStyle(selector: string) {
    const existing = this.styles[selector];
    if (existing) {
      return existing;
    }

    const style = new Style({ project: this.project });
    this._styles$.next({ ...this.styles, [selector]: style });

    return style;
  }
  removeStyle(selector: string): void {
    const existing = this.styles[selector];
    if (!existing) return;

    const styles = { ...this.styles };
    delete styles[selector];
    this._styles$.next(styles);
    existing.dispose();
  }

  setActiveSelector(selector: string | undefined) {
    this._activeSelector$.next(selector);
  }
}
