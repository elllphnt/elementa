import {
  entityTypes,
  Evaluable,
  Expression,
  isReference,
  PrimitiveElementData,
  PrimitiveElementElementData,
  StyleData,
  StylePropertyName,
} from "@elllphnt/elll-element";
import {
  combineLatestOrEmpty,
  Datafiable,
  Disposable,
  pairwiseOrEmpty,
  restoreReactiveMap,
} from "@repo/utils";
import _ from "lodash";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { CssStyleSheet, StylesheetCssStyleSheet } from "~/src/css/_";
import { StyleOverridesMap } from "~/src/style/overrides";
import { Stylesheet } from "~/src/style/stylesheet";
import { Component } from "../../component";
import { ElementElementContainer } from "./_common/container";

export class PrimitiveElementElement
  extends Disposable
  implements Datafiable<PrimitiveElementElementData>
{
  static key = 0;
  key = ++PrimitiveElementElement.key;

  readonly cssStyleSheet: StylesheetCssStyleSheet;
  readonly styleOverridesMap: StyleOverridesMap;

  private _interactions$ = new BehaviorSubject<Record<string, Expression>>({});

  get stylesheet(): Stylesheet {
    return this.cssStyleSheet.stylesheet;
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

  get data(): PrimitiveElementElementData {
    return {
      stylesheet: this.stylesheet.data,
      interactions: this.interactions,
    };
  }
  get data$(): Observable<PrimitiveElementElementData> {
    return combineLatestOrEmpty([
      this.stylesheet.data$,
      this.interactions$,
    ]).pipe(
      map(([stylesheet, interactions]) => ({
        stylesheet,
        interactions,
      })),
    );
  }

  constructor({
    primitiveId,
    elementName,
    component,
  }: {
    primitiveId: string;
    elementName: string;
    component: Component;
  }) {
    super();
    this.styleOverridesMap = new StyleOverridesMap();
    this.cssStyleSheet = new StylesheetCssStyleSheet({
      target: `primitive-element:${primitiveId}:${elementName}`,
      stylesheet: new Stylesheet({
        project: component.project,
      }),
    });

    this.addDisposer(() => {
      this.stylesheet.dispose();
      this._interactions$.complete();
    });
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

  restore(data: PrimitiveElementElementData) {
    this.stylesheet.restore(data.stylesheet ?? {});
    this._interactions$.next(data.interactions ?? {});
  }
}

export class PrimitiveElement extends ElementElementContainer<PrimitiveElementData> {
  private _initialized$ = new BehaviorSubject<boolean | undefined>(undefined);
  private _moduleUrl$ = new BehaviorSubject<string | undefined>(undefined);
  private _props$ = new BehaviorSubject<Record<string, Evaluable<any>>>({});
  private _resolvedProps$ = new BehaviorSubject<Record<string, Evaluable<any>>>(
    {},
  );
  private _elements$ = new BehaviorSubject<
    Record<string, PrimitiveElementElement>
  >({});

  get initialized() {
    return this._initialized$.value;
  }
  get initialized$() {
    return this._initialized$.asObservable();
  }

  get moduleUrl() {
    return this._moduleUrl$.value;
  }
  get moduleUrl$() {
    return this._moduleUrl$.asObservable();
  }

  get absoluteModuleUrl() {
    return this.moduleUrl
      ? this.component.project.infrastructure.fileSystem.getAbsoluteFileUrl(
          this.component.url,
          this.moduleUrl,
        )
      : undefined;
  }
  get absoluteModuleUrl$() {
    return this.moduleUrl$.pipe(
      map((url) => {
        return url
          ? this.component.project.infrastructure.fileSystem.getAbsoluteFileUrl(
              this.component.url,
              url,
            )
          : undefined;
      }),
    );
  }

  get standardModuleUrl() {
    return this.absoluteModuleUrl
      ? this.component.project.infrastructure.fileSystem.getStandardFileUrl(
          this.absoluteModuleUrl,
        )
      : undefined;
  }
  get standardModuleUrl$() {
    return this.absoluteModuleUrl$.pipe(
      map((url) => {
        return url
          ? this.component.project.infrastructure.fileSystem.getStandardFileUrl(
              url,
            )
          : undefined;
      }),
    );
  }

  get moduleName() {
    if (!this.standardModuleUrl) return undefined;
    return this.project.infrastructure.fileSystem.fileName(
      this.standardModuleUrl,
    );
  }
  get moduleName$() {
    return this.standardModuleUrl$.pipe(
      switchMap((url) => {
        return url
          ? this.project.infrastructure.fileSystem.fileName$(url)
          : of(undefined);
      }),
    );
  }

  get props() {
    return this._props$.value;
  }
  get props$() {
    return this._props$.asObservable();
  }
  get resolvedProps() {
    return this._resolvedProps$.value;
  }
  get resolvedProps$() {
    return this._resolvedProps$.asObservable();
  }

  prop(key: string) {
    return this._props$.value[key];
  }
  prop$(key: string) {
    return this._props$.asObservable().pipe(map((props) => props[key]));
  }
  resolvedProp(key: string) {
    return this._resolvedProps$.value[key];
  }
  resolvedProp$(key: string) {
    return this._resolvedProps$.asObservable().pipe(map((props) => props[key]));
  }

  get elements() {
    return this._elements$.value;
  }
  get elements$() {
    return this._elements$.asObservable();
  }

  private _getOrCreateElement(
    elements: Record<string, PrimitiveElementElement>,
    name: string,
  ): PrimitiveElementElement {
    let element = elements[name];
    if (!element) {
      element = new PrimitiveElementElement({
        primitiveId: this.id,
        elementName: name,
        component: this.component,
      });
      this._elements$.next({
        ...elements,
        [name]: element,
      });
    }
    return element;
  }

  element<C extends true | undefined>(
    name: string,
    create?: C,
  ): C extends true
    ? PrimitiveElementElement
    : PrimitiveElementElement | undefined {
    if (create) {
      return this._getOrCreateElement(this.elements, name) as any;
    }
    return this.elements[name] as any;
  }

  element$<C extends true | undefined>(
    name: string,
    create?: C,
  ): Observable<
    C extends true
      ? PrimitiveElementElement
      : PrimitiveElementElement | undefined
  > {
    return this._elements$.pipe(
      map((els) => {
        if (create) {
          return this._getOrCreateElement(els, name) as any;
        }
        return els[name];
      }),
    );
  }

  get allCssStylesheets(): CssStyleSheet[] {
    return [
      ...super.allCssStylesheets,
      ...Object.values(this.elements).map((element) => {
        return element.cssStyleSheet;
      }),
    ];
  }
  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return combineLatest([
      super.allCssStylesheets$,
      this.elements$.pipe(
        map((elements) => {
          return Object.values(elements).map((element) => {
            return element.cssStyleSheet;
          });
        }),
      ),
    ]).pipe(
      map(([stylesheets, elementStylesheets]) => {
        return [...stylesheets, ...elementStylesheets];
      }),
    );
  }

  get data(): PrimitiveElementData {
    return {
      ...super._data,
      initialized: this.initialized,
      moduleUrl: this.moduleUrl,
      props: this.props,
      elements: Object.fromEntries(
        Object.entries(this.elements).map(([key, element]) => [
          key,
          element.data,
        ]),
      ),
    };
  }
  get data$(): Observable<PrimitiveElementData> {
    return combineLatest([
      super._data$,
      this.initialized$,
      this.moduleUrl$,
      this.props$,
      this.elements$.pipe(
        switchMap((elements) =>
          combineLatestOrEmpty(
            Object.entries(elements).map(([key, element]) => {
              return element.data$.pipe(map((data) => [key, data] as const));
            }),
          ).pipe(
            map((data) => {
              return Object.fromEntries(data);
            }),
          ),
        ),
      ),
    ]).pipe(
      map(([data, initialized, moduleUrl, props, elements]) => ({
        ...data,
        initialized,
        moduleUrl,
        props,
        elements,
      })),
    );
  }

  constructor({ id, component }: { id?: string; component: Component }) {
    super({ id, type: entityTypes.elements.primitive, component });

    let resolutionNumber = 0; // used to prevent race conditions
    const resolutions: Record<string, Promise<any>> = {};
    const propsSubscription = this.props$
      .pipe(pairwiseOrEmpty())
      .subscribe(async ([prev, next]) => {
        const currentResolutionNumber = ++resolutionNumber;
        const resolvedProps = Object.fromEntries(
          await Promise.all(
            Object.entries(next).map(async ([key, value]) => {
              if (isReference(value)) {
                const prevValue = prev?.[key];
                if (_.isEqual(value, prevValue)) {
                  if (key in resolutions) {
                    return [key, await resolutions[key]];
                  } else {
                    const promise =
                      this.project.infrastructure.resolveReference(value);
                    resolutions[key] = promise;
                    return [key, await promise];
                  }
                } else {
                  const promise =
                    this.project.infrastructure.resolveReference(value);
                  resolutions[key] = promise;
                  return [key, await promise];
                }
              } else {
                return [key, value];
              }
            }),
          ),
        );

        if (currentResolutionNumber === resolutionNumber) {
          this._resolvedProps$.next(resolvedProps);
        }
      });

    this.addDisposer(() => {
      propsSubscription.unsubscribe();
    });
  }

  setModuleUrl(moduleUrl: string | undefined) {
    this._moduleUrl$.next(moduleUrl);
  }

  setProp(key: string, value: Evaluable<any> | undefined) {
    const newProps = {
      ...this._props$.value,
    };

    if (value === undefined) {
      delete newProps[key];
    } else {
      newProps[key] = value;
    }

    this._props$.next(newProps);
  }

  setElement(name: string, element: PrimitiveElementElement | undefined) {
    const elements = { ...this._elements$.value };

    if (element === undefined) {
      delete elements[name];
    } else {
      elements[name] = element;
    }

    this._elements$.next(elements);
  }

  restore(data: PrimitiveElementData) {
    super.restore(data);

    this._initialized$.next(data.initialized);
    this._moduleUrl$.next(data.moduleUrl);
    this._props$.next(data.props ?? {});

    // restore elements
    restoreReactiveMap({
      datafiable$: this._elements$,
      data: data.elements ?? {},
      create: () => {
        return new PrimitiveElementElement({
          primitiveId: this.id,
          elementName: "name",
          component: this.component,
        });
      },
      restore: (element, data) => {
        element.restore(data);
      },
      dispose: (element) => {
        element.dispose();
      },
    });
  }
}
