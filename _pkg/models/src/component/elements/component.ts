import {
  ComponentElementData,
  Evaluable,
  Expression,
  ResolvableOrEvaluable,
  SlotFillData,
} from "@elllphnt/elementa-base";
import {
  assert,
  combineLatestOrEmpty,
  CRDTModel,
  CRDTModelMap,
  getOrCreateYArray,
  getOrCreateYMap,
} from "@elllphnt/elementa-utils";
import {
  distinctUntilChanged,
  filter,
  map,
  Observable,
  switchMap,
  tap,
} from "rxjs";
import * as y from "yjs";
import { ResolvableRecord } from "~/src/_lib/resolvable";
import { StylesheetCssStyleSheet } from "~/src/css/_";
import { Stylesheet } from "~/src/style/stylesheet";
import { Component } from "../component";
import { IdentifiableModel } from "../identifiable";
import { ElementList } from "./_list";
import { Element } from "./element";

export class SlotFill extends CRDTModel<SlotFillData> {
  readonly component: Component;
  readonly cssStyleSheet: StylesheetCssStyleSheet;
  readonly content: ElementList;

  get allCssStylesheets() {
    return [this.cssStyleSheet, ...this.content.allCssStylesheets];
  }
  get allCssStylesheets$() {
    return combineLatestOrEmpty([this.content.allCssStylesheets$]).pipe(
      map(([childrenStylesheets]) => [
        this.cssStyleSheet,
        ...childrenStylesheets.flat(),
      ])
    );
  }

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

  cloneIds(clone: y.Map<any>): void {
    this.content.cloneIds(getOrCreateYArray(clone, "content"));
  }

  constructor(ymap: y.Map<any>, component: Component) {
    super(ymap);
    this.component = component;
    this.cssStyleSheet = new StylesheetCssStyleSheet({
      target: `slot-fill`,
      stylesheet: new Stylesheet({
        project: component.project,
      }),
    });
    this.content = new ElementList(this.getOrCreateArray("content"), component);

    this.addDisposer(() => {
      this.content.dispose();
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

export class ComponentElement extends Element<ComponentElementData> {
  readonly fills: CRDTModelMap<SlotFill>;
  private _props: ResolvableRecord<Evaluable<any>>;

  get allCssStylesheets() {
    return [
      ...super.allCssStylesheets,
      ...Object.values(this.fills.items).flatMap((s) => s.allCssStylesheets),
    ];
  }
  get allCssStylesheets$() {
    return combineLatestOrEmpty([
      super.allCssStylesheets$,
      this.fills.items$.pipe(
        switchMap((slots) =>
          combineLatestOrEmpty(
            Object.values(slots).map((s) => s.allCssStylesheets$)
          )
        )
      ),
    ]).pipe(
      map(([stylesheets, slotStylesheets]) => [
        ...stylesheets,
        ...slotStylesheets.flat(),
      ])
    );
  }

  get componentUrl() {
    return this.state.componentUrl;
  }
  get componentUrl$() {
    return this.state$.pipe(map((s) => s.componentUrl));
  }

  get absoluteComponentUrl() {
    return this.componentUrl
      ? this.component.project.infrastructure.fileSystem.getAbsoluteFileUrl(
          this.component.url,
          this.componentUrl
        )
      : undefined;
  }
  get absoluteComponentUrl$() {
    return this.componentUrl$.pipe(
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

  get localComponent() {
    return this.absoluteComponentUrl
      ? this.component.project.componentManager.component(
          this.absoluteComponentUrl
        )
      : undefined;
  }
  get localComponent$() {
    return this.absoluteComponentUrl$.pipe(
      map((componentUrl) => {
        return componentUrl
          ? this.component.project.componentManager.component(componentUrl)
          : undefined;
      })
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

  private _addFill(id: string) {
    this.fills.set(id, new y.Map());
  }
  fill$<C extends true | undefined>(
    id: string,
    create?: C
  ): C extends true ? Observable<SlotFill> : Observable<SlotFill | undefined> {
    return this.fills.item$(id).pipe(
      tap((item) => {
        if (!item && create) {
          this._addFill(id);
        }
      }),
      filter((item) => !!item || !create)
    ) as any;
  }
  fill<C extends true | undefined>(
    id: string,
    create?: true
  ): C extends true ? SlotFill : SlotFill | undefined {
    let item = this.fills.item(id);
    if (!item && create) {
      this._addFill(id);
      item = this.fills.item(id);
      assert(item, "Item not found after insertion");
    }
    return item as any;
  }

  constructor(ymap: y.Map<any>, component: Component) {
    super(ymap, component);

    this.fills = new CRDTModelMap(
      this.getOrCreateMap("fills"),
      (map) => new SlotFill(map, component)
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
      this.fills.dispose();
    });
  }

  cloneIds(clone: y.Map<any>): void {
    this.cloneOwnId(clone);
    const yFills = getOrCreateYMap(clone, "fills");
    const fills = this.fills.items;
    IdentifiableModel.cloneIdentifiableMapIds(fills, yFills);
  }

  setComponentUrl(componentUrl: string | undefined) {
    this.patch({ componentUrl });
  }

  setProp(key: string, value: ResolvableOrEvaluable<any> | undefined) {
    const props = { ...this.state.props };
    props[key] = value;
    this.patch({ props });
  }
}
