import {
  ComponentElementData,
  entityTypes,
  Evaluable,
  Expression,
  isReference,
  Resolvable,
  SlotFillData,
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
import { BehaviorSubject, map, Observable, switchMap } from "rxjs";
import { StylesheetCssStyleSheet } from "~/src/css/_";
import { StyleOverridesMap } from "~/src/style/overrides";
import { Stylesheet } from "~/src/style/stylesheet";
import { Component } from "../../component";
import { Entity } from "../entity";
import { ElementContainer, ElementElementContainer } from "./_common/container";
import { Element } from "./element";

export class SlotFill
  extends Disposable
  implements Datafiable<SlotFillData>, ElementContainer
{
  readonly component: Component;
  readonly cssStyleSheet: StylesheetCssStyleSheet;
  readonly styleOverridesMap: StyleOverridesMap;

  private _interactions$ = new BehaviorSubject<Record<string, Expression>>({});
  private _content$ = new BehaviorSubject<Element[]>([]);
  private _contentExpression$ = new BehaviorSubject<Expression | undefined>(
    undefined,
  );

  get stylesheet(): Stylesheet {
    return this.cssStyleSheet.stylesheet;
  }

  get allCssStylesheets() {
    return [
      this.cssStyleSheet,
      ...this.content.flatMap((c) => c.allCssStylesheets),
    ];
  }
  get allCssStylesheets$() {
    return combineLatestOrEmpty([
      this.content$.pipe(
        switchMap((content) =>
          combineLatestOrEmpty(content.map((c) => c.allCssStylesheets$)),
        ),
      ),
    ]).pipe(
      map(([childrenStylesheets]) => [
        this.cssStyleSheet,
        ...childrenStylesheets.flat(),
      ]),
    );
  }

  get content() {
    return this._content$.value;
  }
  get content$() {
    return this._content$.asObservable();
  }

  get contentExpression() {
    return this._contentExpression$.value;
  }
  get contentExpression$() {
    return this._contentExpression$.asObservable();
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

  get data(): SlotFillData {
    return {
      stylesheet: this.stylesheet.data,
      interactions: this.interactions,
      content: this.content.map((content) => content.data),
    };
  }
  get data$(): Observable<SlotFillData> {
    return combineLatestOrEmpty([
      this.stylesheet.data$,
      this.interactions$,
      this.content$.pipe(
        switchMap((content) =>
          combineLatestOrEmpty(content.map((child) => child.data$)),
        ),
      ),
    ]).pipe(
      map(([stylesheet, interactions, content]) => ({
        stylesheet,
        interactions,
        content,
      })),
    );
  }

  constructor({ component }: { component: Component }) {
    super();
    this.component = component;
    this.styleOverridesMap = new StyleOverridesMap();
    this.cssStyleSheet = new StylesheetCssStyleSheet({
      target: `element:slot`,
      stylesheet: new Stylesheet({
        project: component.project,
      }),
    });

    ElementContainer.watchContent(this);

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

  setContent(elements: Element[]): void {
    this._content$.next(elements);
  }
  setContentExpression(expression: Expression | undefined): void {
    this._contentExpression$.next(expression);
  }

  prependElements(...elements: Element[]) {
    ElementContainer.prependElements(this, ...elements);
  }
  appendElements(...elements: Element[]) {
    ElementContainer.appendElements(this, ...elements);
  }
  insertElements(index: number, ...elements: Element[]) {
    ElementContainer.insertElements(this, index, ...elements);
  }
  removeElements(...elements: Element[]) {
    ElementContainer.removeElements(this, ...elements);
  }
  moveElements(index: number, ...elements: Element[]) {
    ElementContainer.moveElements(this, index, ...elements);
  }

  remove(): void {
    console.warn("Cannot remove slot");
  }

  restore(data: SlotFillData) {
    // styles
    this.stylesheet.restore(data.stylesheet ?? {});

    // interactions
    this._interactions$.next(data.interactions ?? {});

    // children
    Entity.restoreReactiveArray({
      datafiables$: this._content$,
      data: data.content,
      component: this.component,
    });
  }
}

export class ComponentElement extends ElementElementContainer<ComponentElementData> {
  private _componentUrl$ = new BehaviorSubject<string | undefined>(undefined);
  private _props$ = new BehaviorSubject<
    Record<string, Resolvable<Evaluable<any>>>
  >({});
  private _resolvedProps$ = new BehaviorSubject<Record<string, Evaluable<any>>>(
    {},
  );
  private _unwrapped$ = new BehaviorSubject<boolean | undefined>(undefined);
  private _initialized$ = new BehaviorSubject<boolean | undefined>(undefined);
  private _slotFills$ = new BehaviorSubject<Record<string, SlotFill>>({});

  get allCssStylesheets() {
    return [
      ...super.allCssStylesheets,
      ...Object.values(this.slotFills).flatMap((s) => s.allCssStylesheets),
    ];
  }
  get allCssStylesheets$() {
    return combineLatestOrEmpty([
      super.allCssStylesheets$,
      this.slotFills$.pipe(
        switchMap((slots) =>
          combineLatestOrEmpty(
            Object.values(slots).map((s) => s.allCssStylesheets$),
          ),
        ),
      ),
    ]).pipe(
      map(([stylesheets, slotStylesheets]) => [
        ...stylesheets,
        ...slotStylesheets.flat(),
      ]),
    );
  }

  get componentUrl() {
    return this._componentUrl$.value;
  }
  get componentUrl$() {
    return this._componentUrl$.asObservable();
  }

  get localComponent() {
    return this.absoluteComponentUrl
      ? this.project.componentManager.component(this.absoluteComponentUrl)
      : undefined;
  }
  get localComponent$() {
    return this.absoluteComponentUrl$.pipe(
      map((componentUrl) => {
        return componentUrl
          ? this.project.componentManager.component(componentUrl)
          : undefined;
      }),
    );
  }

  get componentName() {
    return this.localComponent?.name;
  }
  get componentName$() {
    return this.localComponent$.pipe(map((component) => component?.name));
  }

  get template() {
    return this.localComponent?.template ?? [];
  }
  get template$() {
    return this.localComponent$.pipe(map((component) => component?.template));
  }

  get absoluteComponentUrl() {
    return this.componentUrl
      ? this.component.project.infrastructure.fileSystem.getAbsoluteFileUrl(
          this.component.url,
          this.componentUrl,
        )
      : undefined;
  }
  get absoluteComponentUrl$() {
    return this.componentUrl$.pipe(
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

  get standardComponentUrl() {
    return this.absoluteComponentUrl
      ? this.component.project.infrastructure.fileSystem.getStandardFileUrl(
          this.absoluteComponentUrl,
        )
      : undefined;
  }
  get standardComponentUrl$() {
    return this.absoluteComponentUrl$.pipe(
      map((url) => {
        return url
          ? this.component.project.infrastructure.fileSystem.getStandardFileUrl(
              url,
            )
          : undefined;
      }),
    );
  }

  get unwrapped() {
    return this._unwrapped$.value;
  }
  get unwrapped$() {
    return this._unwrapped$.asObservable();
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

  get slotFills() {
    return this._slotFills$.value;
  }
  get slotFills$() {
    return this._slotFills$.asObservable();
  }

  private _getOrCreateSlotFill(
    slotMap: Record<string, SlotFill>,
    id: string,
  ): SlotFill {
    let slot = slotMap[id];
    if (!slot) {
      slot = new SlotFill({ component: this.component });
      this._slotFills$.next({
        ...slotMap,
        [id]: slot,
      });
    }
    return slot;
  }
  slotFill$<C extends true | undefined>(
    id: string,
    create?: C,
  ): C extends true ? Observable<SlotFill> : Observable<SlotFill | undefined> {
    return this._slotFills$.pipe(
      map((slots) => {
        if (create) {
          return this._getOrCreateSlotFill(slots, id);
        } else {
          return slots[id];
        }
      }),
    );
  }
  slotFill<C extends true | undefined>(
    id: string,
    create?: true,
  ): C extends true ? SlotFill : SlotFill | undefined {
    if (create) {
      return this._getOrCreateSlotFill(this.slotFills, id);
    } else {
      return this.slotFills[id];
    }
  }

  get initialized() {
    return this._initialized$.value;
  }
  get initialized$() {
    return this._initialized$.asObservable();
  }

  get data(): ComponentElementData {
    return {
      ...super._data,
      componentUrl: this.componentUrl,
      props: this.props,
      unwrapped: this.unwrapped,
      slotFills: Object.fromEntries(
        Object.entries(this.slotFills).map(([key, slot]) => [key, slot.data]),
      ),
    } as ComponentElementData;
  }
  get data$(): Observable<ComponentElementData> {
    return combineLatestOrEmpty([
      super._data$,
      this.componentUrl$,
      this.props$,
      this.unwrapped$,
      this.slotFills$.pipe(
        switchMap((slots) =>
          combineLatestOrEmpty(
            Object.entries(slots).map(([key, slot]) =>
              slot.data$.pipe(map((data) => [key, data])),
            ),
          ),
        ),
        map((slots) => Object.fromEntries(slots)),
      ),
    ]).pipe(
      map(([data, componentUrl, props, unwrapped, slotFills]) => ({
        ...data,
        componentUrl,
        props,
        unwrapped,
        slotFills,
      })),
    );
  }

  constructor({ id, component }: { id?: string; component: Component }) {
    super({ id, type: entityTypes.elements.component, component });

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

  setComponentUrl(componentUrl: string | undefined) {
    this._componentUrl$.next(componentUrl);
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

  setSlotFill(key: string, fill: SlotFill) {
    const newFills = {
      ...this._slotFills$.value,
      [key]: fill,
    };

    this._slotFills$.next(newFills);
  }

  setUnwrapped(unwrapped: boolean | undefined) {
    this._unwrapped$.next(unwrapped);
  }

  restore(data: ComponentElementData) {
    super.restore(data);

    this._componentUrl$.next(data.componentUrl);
    this._props$.next(data.props ?? {});
    this._unwrapped$.next((data as any).naked);

    restoreReactiveMap({
      datafiable$: this._slotFills$,
      data: data.slotFills,
      create: () => new SlotFill({ component: this.component }),
      restore: (element, data) => element.restore(data),
      dispose: (element) => element.dispose(),
    });
  }
}
