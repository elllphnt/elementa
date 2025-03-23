import { baseSelector, StylableData } from "@elllphnt/elll-element";
import { combineLatestOrEmpty, Disposable } from "@repo/utils";
import { BehaviorSubject, map, Observable, switchMap } from "rxjs";
import { Datafiable, restoreReactiveMap } from "~/src/_lib/restore";
import { Project } from "~/src/project/_";
import { Style } from "./style";
import { StyleFragmentRegistry } from "./style_fragment_set";

/**
 * A standalone modelization of an Elll StylesheetData object.
 * Can be used to store and manipulate stylesheet data.
 */
export class Stylesheet extends Disposable implements Datafiable<StylableData> {
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  readonly key = `${Stylesheet.keySeed}-${Stylesheet.key++}`;
  readonly project: Project;
  readonly fragmentRegistry = new StyleFragmentRegistry();

  private _styles$ = new BehaviorSubject<Record<string, Style>>({});

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

  get data(): StylableData {
    return {
      styles: Object.fromEntries(
        Object.entries(this.styles).map(([selector, style]) => [
          selector,
          style.data,
        ]),
      ),
      styleFragments: this.fragmentRegistry.data,
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
      this.fragmentRegistry.data$,
    ]).pipe(
      map(([styles, styleFragments]) => ({
        styles,
        styleFragments,
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

  restore(data: StylableData): void {
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

    this.fragmentRegistry.restore(data.styleFragments || []);
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
  removeStyle(selector: string): void {
    const existing = this.styles[selector];
    if (!existing) return;

    const styles = { ...this.styles };
    delete styles[selector];
    this._styles$.next(styles);
    existing.dispose();
  }
}
