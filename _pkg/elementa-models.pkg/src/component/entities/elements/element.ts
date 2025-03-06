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
import { BehaviorSubject, map, Observable, of, switchMap } from "rxjs";
import { restoreReactiveArray } from "~/src/_lib/restore";
import { CssStyleSheet } from "~/src/css/_";
import { StylesheetCssStyleSheet } from "~/src/css/stylesheets/stylesheet/stylesheet";
import { StyleOverridesMap, Stylesheet } from "~/src/style/_";
import { Component } from "../../component";
import { Entity } from "../entity";
import { ElementConnection } from "./_common/connection";
import { ElementContainer } from "./_common/element_container";

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
  private _connections$ = new BehaviorSubject<ElementConnection[]>([]);

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

  // connections

  get connections() {
    return this._connections$.value;
  }
  get connections$() {
    return this._connections$.asObservable();
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

  // styles

  get styles() {
    return this.stylesheet.styles;
  }
  get styles$() {
    return this.stylesheet.styles$;
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
      styles: Object.fromEntries(
        Object.entries(this.styles).map(([key, style]) => [key, style.data]),
      ),
      styleOverrides: this.styleOverridesMap.data as any,
      interactions: this.interactions,
      hidden: this.hidden,
      connections: this.connections.map((connection) => connection.data),
      repeat: this.repeat,
    };
  }
  get _data$(): Observable<ElementData> {
    return combineLatestOrEmpty([
      super._data$,
      this.link$,
      this.styles$.pipe(
        switchMap((styles) =>
          combineLatestOrEmpty(
            Object.entries(styles).map(([key, style]) =>
              style.data$.pipe(map((data) => [key, data])),
            ),
          ),
        ),
        map((styles) => Object.fromEntries(styles)),
      ),
      this.styleOverridesMap.data$,
      this.interactions$,
      this.hidden$,
      this.connections$.pipe(
        switchMap((connections) =>
          combineLatestOrEmpty(
            connections.map((connection) => connection.data$),
          ),
        ),
      ),
      this.repeat$,
    ]).pipe(
      map(
        ([
          data,
          link,
          styles,
          styleOverrides,
          interactions,
          hidden,
          connections,
          repeat,
        ]) => ({
          ...data,
          link,
          styles,
          styleOverrides: styleOverrides as any,
          interactions,
          hidden,
          connections,
          repeat,
        }),
      ),
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

  addConnection(connection: ElementConnection) {
    this._connections$.next([...this.connections, connection]);
  }
  removeConnection(connection: ElementConnection) {
    connection.setSource(undefined);
    this._connections$.next(this.connections.filter((c) => c !== connection));
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
    this.stylesheet.restore({
      styles: data.styles,
    });

    // hidden
    this._hidden$.next(data.hidden ?? {});

    // link
    this._link$.next(data.link);

    // interactions
    this._interactions$.next(data.interactions ?? {});

    // connections
    restoreReactiveArray({
      datafiables$: this._connections$,
      data: data.connections,
      create: ({ key }) => new ElementConnection({ element: this, key }),
      restore: (connection, data) => {
        connection.restore(data);
        return connection;
      },
      identifyData: (connection) => connection.key,
      identifyDatafiable: (connection) => connection.key,
      dispose: (connection) => connection.dispose(),
    });

    // repeat
    this._repeat$.next(data.repeat);
  }
}
