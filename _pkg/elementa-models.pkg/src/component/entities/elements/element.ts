import {
  ElementData,
  ElementRepeatData,
  Evaluable,
  EvaluableMap,
  Expression,
  LinkData,
  StyleData,
  StylePropertyName,
} from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, Observable, of } from "rxjs";
import { CssStyleSheet } from "~/src/css/_";
import { StylesheetCssStyleSheet } from "~/src/css/stylesheets/stylesheet/stylesheet";
import { StyleOverridesMap, Stylesheet } from "~/src/style/_";
import { Component } from "../../component";
import { Entity } from "../entity";
import { ElementContainer } from "./_common/container";

export abstract class Element<
  D extends ElementData = ElementData,
> extends Entity<D> {
  readonly cssStyleSheet: StylesheetCssStyleSheet;
  readonly styleOverridesMap: StyleOverridesMap;

  private _link$ = new BehaviorSubject<EvaluableMap<LinkData> | undefined>(
    undefined,
  );
  private _hidden$ = new BehaviorSubject<Record<string, boolean>>({});
  private _interactions$ = new BehaviorSubject<Record<string, Expression>>({});

  private _container$ = new BehaviorSubject<ElementContainer | undefined>(
    undefined,
  );
  private _repeat$ = new BehaviorSubject<ElementRepeatData | undefined>(
    undefined,
  );

  get stylesheet(): Stylesheet {
    return this.cssStyleSheet.stylesheet;
  }

  get allCssStylesheets(): CssStyleSheet[] {
    return [this.cssStyleSheet];
  }
  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return of([this.cssStyleSheet]);
  }

  // hidden

  get hidden() {
    return this._hidden$.value;
  }
  get hidden$() {
    return this._hidden$.asObservable();
  }

  // link

  get link() {
    return this._link$.value;
  }
  get link$() {
    return this._link$.asObservable();
  }

  // interactions

  get interactions() {
    return this._interactions$.value;
  }
  get interactions$() {
    return this._interactions$.asObservable();
  }

  interaction(event: string) {
    return this.interactions[event];
  }
  interaction$(event: string) {
    return this.interactions$.pipe(map((interactions) => interactions[event]));
  }

  // container

  get container() {
    return this._container$.value;
  }
  get container$() {
    return this._container$.asObservable();
  }

  // parent

  get parent(): Element | undefined {
    return this.container instanceof Element ? this.container : undefined;
  }
  get parent$(): Observable<Element | undefined> {
    return this.container$.pipe(
      map((container) =>
        container instanceof Element ? container : undefined,
      ),
    );
  }

  // style overrides

  get styleOverrides() {
    return this.styleOverridesMap.data;
  }
  get styleOverrides$() {
    return this.styleOverridesMap.data$;
  }

  styleOverride(property: StylePropertyName) {
    return this.styleOverridesMap.override(property);
  }
  styleOverride$(property: StylePropertyName) {
    return this.styleOverridesMap.override$(property);
  }

  get repeat() {
    return this._repeat$.value;
  }
  get repeat$() {
    return this._repeat$.asObservable();
  }

  get _data(): ElementData {
    return {
      ...super._data,
      type: this.type,
      link: this.link,
      stylesheet: this.stylesheet.data,
      interactions: this.interactions,
      hidden: this.hidden,
      repeat: this.repeat,
    };
  }
  get _data$(): Observable<ElementData> {
    return combineLatestOrEmpty([
      super._data$,
      this.link$,
      this.stylesheet.data$,
      this.interactions$,
      this.hidden$,
      this.repeat$,
    ]).pipe(
      map(([data, link, stylesheet, interactions, hidden, repeat]) => ({
        ...data,
        link,
        stylesheet,
        interactions,
        hidden,
        repeat,
      })),
    );
  }

  constructor({
    id,
    type,
    component,
  }: {
    id?: string;
    type: string;
    component: Component;
  }) {
    super({ id, component, type });
    this.styleOverridesMap = new StyleOverridesMap();
    this.cssStyleSheet = new StylesheetCssStyleSheet({
      target: `${this.type}:${this.id}`,
      stylesheet: new Stylesheet({
        project: component.project,
      }),
    });

    this.addDisposer(() => {
      this.stylesheet.dispose();
      this._link$.complete();
      this._hidden$.complete();
      this._interactions$.complete();
      this._container$.complete();
      this._repeat$.complete();
    });
  }

  setContainer(container: ElementContainer | undefined) {
    this._container$.next(container);
  }
  setLink(link: EvaluableMap<LinkData> | undefined) {
    this._link$.next(link);
  }

  setInteraction(event: string, handler: Expression) {
    this._interactions$.next({
      ...this.interactions,
      [event]: handler,
    });
  }
  clearInteraction(event: string) {
    const interactions = { ...this.interactions };
    delete interactions[event];
    this._interactions$.next(interactions);
  }

  isChildOf(element: Entity) {
    return this.parent === element;
  }
  isDescendantOf(element: Entity) {
    let parent = this.parent;
    while (parent) {
      if (parent === element) {
        return true;
      }
      parent = parent.parent;
    }
    return false;
  }

  addStyle(selector: string) {
    this.stylesheet.addStyle(selector);
  }
  removeStyle(selector: string) {
    this.stylesheet.removeStyle(selector);
  }

  setStyleOverride<N extends StylePropertyName>(
    property: N,
    value: Evaluable<StyleData[N]> | undefined,
  ) {
    this.styleOverridesMap.setOverride(property, value);
  }

  setRepeat(repeat: ElementRepeatData | undefined) {
    this._repeat$.next(repeat);
  }

  remove(): void {
    this.container?.removeElements(this as any);
  }

  restore(data: D) {
    super.restore(data);

    // styles
    this.stylesheet.restore(data.stylesheet ?? {});

    // hidden
    this._hidden$.next(data.hidden ?? {});

    // link
    this._link$.next(data.link);

    // interactions
    this._interactions$.next(data.interactions ?? {});

    // repeat
    this._repeat$.next(data.repeat);
  }
}
