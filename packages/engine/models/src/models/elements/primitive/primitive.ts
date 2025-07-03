import type {
  PrimitiveElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import {
  AggregatedModelList,
  AggregatedModelRecord,
} from "@elllphnt/elementa-kernel";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { Observable } from "rxjs";
import { combineLatest, filter, map, of, switchMap, tap } from "rxjs";
import type { CssStyleSheet } from "~/css/lib/stylesheet.js";
import { BaseElement } from "../_base.js";
import type { Element } from "../_element.js";
import { createElement } from "../_element.js";
import type { ElementEnvironment } from "../_environment.js";
import { PrimitiveSubElement } from "./sub_element.js";

export class PrimitiveElement extends BaseElement<PrimitiveElementData> {
  private _content: AggregatedModelList<RecordState<any>, Element>;
  private _subElements: AggregatedModelRecord<
    RecordState<any>,
    PrimitiveSubElement
  >;

  get content(): Element[] {
    return this._content.models;
  }

  get content$(): Observable<Element[]> {
    return this._content.models$;
  }

  get subElements(): Record<string, PrimitiveSubElement> {
    return this._subElements.models;
  }

  get subElements$(): Observable<Record<string, PrimitiveSubElement>> {
    return this._subElements.models$;
  }

  get allCssStylesheets(): CssStyleSheet[] {
    return [
      this.cssStyleSheet,
      ...this.content.map((s) => s.cssStyleSheet),
      ...Object.values(this.subElements).map((s) => s.cssStyleSheet),
    ];
  }

  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return combineLatest([
      of([this.cssStyleSheet]),
      this.content$.pipe(map((s) => s.map((s) => s.cssStyleSheet))),
      this.subElements$.pipe(
        map((s) => Object.values(s).map((s) => s.cssStyleSheet))
      ),
    ]).pipe(
      map(([main, content, subElements]) => [
        ...main,
        ...content,
        ...subElements,
      ])
    );
  }

  get primitiveUrl(): string | undefined {
    return this.state.entry("primitiveUrl");
  }

  get primitiveUrl$(): Observable<string | undefined> {
    return this.state.entry$("primitiveUrl");
  }

  get props(): Record<string, any> | undefined {
    return this.state.entry("props");
  }

  get props$(): Observable<Record<string, any> | undefined> {
    return this.state.entry$("props");
  }

  get slotIds(): string[] {
    return this.content.flatMap((c) => c.slotIds);
  }

  get slotIds$(): Observable<string[]> {
    return this.content$.pipe(
      switchMap((c) => combineLatestOrEmpty(c.map((c) => c.slotIds$))),
      map((slotIdsArrays) => slotIdsArrays.flat())
    );
  }

  constructor({
    state,
    environment,
    initialized,
  }: {
    state: RecordState<PrimitiveElementData>;
    environment: ElementEnvironment;
    initialized?: boolean;
  }) {
    super({ state, type: "primitive", environment, initialized });

    this._content = new AggregatedModelList({
      state: state.getListOfRecordStates("content"),
      create: (state) =>
        createElement({
          state,
          environment: this.environment,
          initialized: true,
        }),
    });

    this._subElements = new AggregatedModelRecord({
      state: state.getRecordOfRecordStates("elements"),
      create: (state, _, init) =>
        new PrimitiveSubElement({
          state,
          environment: this.environment,
          initialized: init && initialized,
        }),
    });

    this.addInitializer(() => {
      this._content.initialize();
      this._subElements.initialize();

      this.addDisposer(() => {
        this._content.dispose();
        this._subElements.dispose();
      });
    });
  }

  prop(key: string): any {
    return this.props?.[key];
  }

  prop$(key: string): Observable<any> {
    return this.props$.pipe(map((props) => props?.[key]));
  }

  setPrimitiveUrl(url: string | undefined): void {
    this.state.set("primitiveUrl", url);
  }

  setProp(key: string, value: ResolvableOrEvaluable<any> | undefined): void {
    const props = { ...this.props };

    if (value === undefined) {
      delete props[key];
    } else {
      props[key] = value;
    }

    this.state.set("props", props);
  }

  subElement(name: string): PrimitiveSubElement | undefined;
  subElement(name: string, create: true): PrimitiveSubElement;
  subElement(name: string, create?: true): PrimitiveSubElement | undefined {
    let element = this._subElements.models[name];

    if (!element && create) {
      element = new PrimitiveSubElement({
        state: this._subElements.state.entry(name, () =>
          this.state.backend.createRecordState<PrimitiveElementData>()
        ),
        environment: this.environment,
        initialized: true,
      });

      this._subElements.set(name, element);
    }

    return element;
  }

  subElement$(name: string): Observable<PrimitiveSubElement | undefined>;
  subElement$(name: string, create: true): Observable<PrimitiveSubElement>;
  subElement$(
    name: string,
    create?: true
  ): Observable<PrimitiveSubElement | undefined> {
    return this._subElements.models$.pipe(
      map((record) => record[name]),
      tap((element) => {
        if (!element && create) {
          const newElement = new PrimitiveSubElement({
            state: this._subElements.state.entry(name, () =>
              this.state.backend.createRecordState<PrimitiveElementData>()
            ),
            environment: this.environment,
            initialized: true,
          });

          this._subElements.set(name, newElement);
        }
      }),
      filter((element) => !create || !!element)
    );
  }
}
