import {
  ensureField,
  getOrCreateYArray,
  getOrCreateYMap,
} from "@elllphnt/crdt";
import {
  PrimitiveElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import {
  CssStyleSheet,
  Element,
  ElementEnvironment,
  PrimitiveElement,
  PrimitiveSubElement,
} from "@elllphnt/elementa-core";
import {
  AggregatedCrdtModelList,
  AggregatedCrdtModelRecord,
  combineLatestArrays,
  combineLatestOrEmpty,
} from "@elllphnt/elementa-utils";
import { filter, map, Observable, of, switchMap, tap } from "rxjs";
import * as y from "yjs";
import { CrdtBaseElement } from "../_base.js";
import { CrdtcreateElement, CrdtElement } from "../_element.js";
import { CrdtPrimitiveSubElement } from "./sub_element.js";

export class CrdtPrimitiveElement
  extends CrdtBaseElement<PrimitiveElementData>
  implements PrimitiveElement
{
  private _content: AggregatedCrdtModelList<CrdtElement>;
  private _subElements: AggregatedCrdtModelRecord<CrdtPrimitiveSubElement>;

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
    return this._state.entry("primitiveUrl");
  }

  get primitiveUrl$(): Observable<string | undefined> {
    return this._state.entry$("primitiveUrl");
  }

  get props(): Record<string, any> | undefined {
    return this._state.entry("props");
  }

  get props$(): Observable<Record<string, any> | undefined> {
    return this._state.entry$("props");
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
    crdt,
    environment,
    initialized,
  }: {
    crdt: y.Map<any>;
    environment: ElementEnvironment;
    initialized?: boolean;
  }) {
    super({ crdt, type: "primitive", environment, initialized });

    if (!initialized) {
      ensureField(crdt, "content", () => new y.Array());
      ensureField(crdt, "elements", () => new y.Map());
    }

    this._content = new AggregatedCrdtModelList({
      crdt: getOrCreateYArray<y.Map<any>>(crdt, "content"),
      create: (crdt, init) =>
        CrdtcreateElement({
          crdt,
          environment: this.environment,
          initialized: init && initialized,
        }),
    });

    this._subElements = new AggregatedCrdtModelRecord({
      crdt: getOrCreateYMap(crdt, "elements"),
      create: (crdt, key, init) =>
        new CrdtPrimitiveSubElement({
          crdt,
          environment: this.environment,
          initialized: init && initialized,
        }),
    });

    this.addDisposer(() => {
      this._content.dispose();
      this._subElements.dispose();
    });
  }

  prop(key: string): any {
    return this.props?.[key];
  }

  prop$(key: string): Observable<any> {
    return this.props$.pipe(map((props) => props?.[key]));
  }

  setPrimitiveUrl(url: string | undefined): void {
    this._state.set("primitiveUrl", url);
  }

  setProp(key: string, value: ResolvableOrEvaluable<any> | undefined): void {
    const props = { ...this.props };

    if (value === undefined) {
      delete props[key];
    } else {
      props[key] = value;
    }

    this._state.set("props", props);
  }

  subElement(name: string): PrimitiveSubElement | undefined;
  subElement(name: string, create: true): PrimitiveSubElement;
  subElement(name: string, create?: true): PrimitiveSubElement | undefined {
    let element = this._subElements.models[name];

    if (!element && create) {
      const map = new y.Map();
      element = new CrdtPrimitiveSubElement({
        crdt: map,
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
          const map = new y.Map();
          const newElement = new CrdtPrimitiveSubElement({
            crdt: map,
            environment: this.environment,
            initialized: true,
          });

          this._subElements.set(name, newElement);
        }
      }),
      filter((element) => !create || !!element)
    );
  }

  initialize(data: Omit<PrimitiveElementData, "id" | "type">): void {
    // Set primitive data on CRDT
    if (data.primitiveUrl !== undefined) {
      this._state.set("primitiveUrl", data.primitiveUrl);
    }
    if (data.props !== undefined) {
      this._state.set("props", data.props);
    }
    // Note: content and elements would need more complex initialization
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtPrimitiveElement({
      crdt,
      environment: this.environment,
      initialized: true,
    }) as this;
  }
}
