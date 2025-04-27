import {
  Evaluable,
  Expression,
  PrimitiveElementData,
  PrimitiveSubElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import { assert, CRDTModelMap, MapCRDTModel } from "@elllphnt/elementa-utils";
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from "rxjs";
import * as y from "yjs";
import { ResolvableRecord } from "../../_lib/resolvable";
import { CssStyleSheet, StylesheetCssStyleSheet } from "../../css/_";
import { Stylesheet } from "../../style/stylesheet";
import { Component } from "../component";
import { Element } from "./element";

export class PrimitiveSubElement extends MapCRDTModel<PrimitiveSubElementData> {
  readonly component: Component;
  readonly cssStyleSheet: StylesheetCssStyleSheet;

  get interactions() {
    return this.state.interactions ?? {};
  }
  get interactions$() {
    return this.state$.pipe(
      map((data) => data.interactions ?? {}),
      distinctUntilChanged()
    );
  }

  interaction(event: string) {
    return this.interactions[event];
  }
  interaction$(event: string) {
    return this.interactions$.pipe(map((interactions) => interactions[event]));
  }

  constructor(ymap: y.Map<any>, component: Component) {
    super(ymap);
    this.component = component;
    this.cssStyleSheet = new StylesheetCssStyleSheet({
      target: `primitive-sub-element`,
      stylesheet: new Stylesheet(
        this.getOrCreateMap("stylesheet"),
        component.project
      ),
    });

    this.addDisposer(() => {
      this.cssStyleSheet.dispose();
    });
  }

  setInteraction(key: string, interaction: Expression) {
    const interactions = { ...this.interactions };
    interactions[key] = interaction;
    this.patch({ interactions });
  }
  clearInteractions() {
    this.patch({ interactions: {} });
  }
}

export class PrimitiveElement extends Element<PrimitiveElementData> {
  readonly elements: CRDTModelMap<PrimitiveSubElement>;

  private readonly _props: ResolvableRecord<Evaluable<any>>;

  get primitiveUrl() {
    return this.state.primitiveUrl;
  }
  get primitiveUrl$() {
    return this.state$.pipe(map((s) => s.primitiveUrl));
  }

  get absoluteModuleUrl() {
    return this.primitiveUrl
      ? this.component.project.infrastructure.fileSystem.getAbsoluteFileUrl(
          this.component.url,
          this.primitiveUrl
        )
      : undefined;
  }
  get absoluteModuleUrl$() {
    return this.primitiveUrl$.pipe(
      map((url) => {
        return url
          ? this.component.project.infrastructure.fileSystem.getAbsoluteFileUrl(
              this.component.url,
              url
            )
          : undefined;
      })
    );
  }

  get moduleName() {
    if (!this.absoluteModuleUrl) return undefined;
    return this.component.project.infrastructure.fileSystem.fileName(
      this.absoluteModuleUrl
    );
  }
  get moduleName$() {
    return this.absoluteModuleUrl$.pipe(
      switchMap((url) => {
        return url
          ? this.component.project.infrastructure.fileSystem.fileName$(url)
          : of(undefined);
      })
    );
  }

  get props$() {
    return this._props.value$;
  }
  get props() {
    return this._props.value;
  }

  prop(key: string) {
    return this.props[key];
  }
  prop$(key: string) {
    return this.props$.pipe(map((props) => props[key]));
  }

  private _addElement(name: string) {
    this.elements.set(name, new y.Map());
  }
  element<C extends true | undefined>(
    name: string,
    create?: C
  ): C extends true ? PrimitiveSubElement : PrimitiveSubElement | undefined {
    let element = this.elements.item(name);
    if (!element && create) {
      this._addElement(name);
      element = this.elements.item(name);
      assert(element, "Element not found after insertion");
    }
    return element as any;
  }
  element$<C extends true | undefined>(
    name: string,
    create?: C
  ): Observable<
    C extends true ? PrimitiveSubElement : PrimitiveSubElement | undefined
  > {
    return this.elements.item$(name).pipe(
      tap((element) => {
        if (!element && create) {
          this._addElement(name);
        }
      }),
      filter((element) => !!element || !create)
    ) as any;
  }

  get allCssStylesheets(): CssStyleSheet[] {
    return [
      ...super.allCssStylesheets,
      ...Object.values(this.elements.items).map((element) => {
        return element.cssStyleSheet;
      }),
    ];
  }
  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return combineLatest([
      super.allCssStylesheets$,
      this.elements.items$.pipe(
        map((elements) =>
          Object.values(elements).map((element) => element.cssStyleSheet)
        )
      ),
    ]).pipe(
      map(([stylesheets, elementStylesheets]) => {
        return [...stylesheets, ...elementStylesheets];
      })
    );
  }

  constructor(ymap: y.Map<any>, component: Component) {
    super(ymap, component);

    this.elements = new CRDTModelMap<PrimitiveSubElement>(
      ymap,
      (ymap) => new PrimitiveSubElement(ymap, component)
    );

    this._props = new ResolvableRecord(
      this.state.props ?? {},
      component.project.infrastructure
    );
    const propsSubscription = this._props.subscribe(
      this.state$.pipe(map((s) => s.props || {}))
    );

    this.addDisposer(() => {
      propsSubscription.unsubscribe();
      this._props.dispose();
    });
  }

  cloneIds(clone: y.Map<any>): void {
    this.cloneOwnId(clone);
  }

  setPrimitiveUrl(primitiveUrl: string | undefined) {
    this.patch({ primitiveUrl });
  }

  setProp(key: string, value: ResolvableOrEvaluable<any> | undefined) {
    const props = { ...this.state.props };
    props[key] = value;
    this.patch({ props });
  }
}
