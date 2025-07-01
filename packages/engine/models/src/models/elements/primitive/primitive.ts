import {
  PrimitiveElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  AggregatedModelRecord,
  RecordState,
} from "@elllphnt/elementa-kernel";
import {
  combineLatestArrays,
  combineLatestOrEmpty,
} from "@elllphnt/elementa-lang-utils";
import { filter, map, Observable, of, switchMap, tap } from "rxjs";
import { CssStyleSheet } from "~/css/lib/stylesheet.js";
import { modelsLogger } from "../../../loggers.js";
import { BaseElement } from "../_base.js";
import { createElement, Element } from "../_element.js";
import { ElementEnvironment } from "../_environment.js";
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
    return combineLatestArrays([
      of([this.cssStyleSheet]),
      this.content$.pipe(map((s) => s.map((s) => s.cssStyleSheet))),
      this.subElements$.pipe(
        map((s) => Object.values(s).map((s) => s.cssStyleSheet))
      ),
    ]);
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

    modelsLogger.info("Creating primitive element", {
      elementId: this.id,
      elementType: this.type,
      primitiveUrl: this.primitiveUrl,
      projectId: environment.project.id,
      initialized: initialized ?? false,
    });

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
      modelsLogger.debug("Initializing primitive element models", {
        elementId: this.id,
        primitiveUrl: this.primitiveUrl,
        contentCount: this._content.models.length,
        subElementsCount: Object.keys(this._subElements.models).length,
        propsCount: Object.keys(this.props || {}).length,
        slotIdsCount: this.slotIds.length,
      });

      this._content.initialize();
      this._subElements.initialize();

      this.addDisposer(() => {
        modelsLogger.debug("Disposing primitive element models", {
          elementId: this.id,
          primitiveUrl: this.primitiveUrl,
          contentCount: this._content.models.length,
          subElementsCount: Object.keys(this._subElements.models).length,
        });
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
      modelsLogger.debug("Creating new primitive sub-element", {
        elementId: this.id,
        subElementName: name,
        totalSubElements: Object.keys(this._subElements.models).length,
      });

      element = new PrimitiveSubElement({
        state: this._subElements.state.entry(name, () =>
          this.state.backend.createRecordState<PrimitiveElementData>()
        ),
        environment: this.environment,
        initialized: true,
      });

      this._subElements.set(name, element);

      modelsLogger.debug("Primitive sub-element created and added", {
        elementId: this.id,
        subElementName: name,
        totalSubElements: Object.keys(this._subElements.models).length,
      });
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
