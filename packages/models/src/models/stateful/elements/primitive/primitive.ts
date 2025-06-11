import {
  PrimitiveElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import {
  CssStyleSheet,
  Element,
  PrimitiveElement,
  PrimitiveSubElement,
  RenderingEnvironment,
} from "@elllphnt/elementa-core";
import {
  AggregatedModelList,
  AggregatedModelRecord,
  combineLatestArrays,
  combineLatestMerged,
  combineLatestOrEmpty,
} from "@elllphnt/elementa-utils";
import {
  combineLatest,
  filter,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from "rxjs";
import { StatefulBaseElement } from "../_base.js";
import { StatefulcreateElement, StatefulElement } from "../_element.js";
import { StatefulPrimitiveSubElement } from "./sub_element.js";

export class StatefulPrimitiveElement
  extends StatefulBaseElement<PrimitiveElementData, "content" | "elements">
  implements PrimitiveElement
{
  // private properties
  private _content: AggregatedModelList<StatefulElement>;
  private _subElements: AggregatedModelRecord<StatefulPrimitiveSubElement>;

  // getters
  get content(): Element[] {
    return this._content.state.items;
  }

  get content$(): Observable<Element[]> {
    return this._content.state.items$;
  }

  get subElements() {
    return this._subElements.state.record;
  }
  get subElements$() {
    return this._subElements.state.record$;
  }

  get allCssStylesheets(): CssStyleSheet[] {
    return [
      this.cssStyleSheet,
      ...Object.values(this.content).map((s) => s.cssStyleSheet),
      ...Object.values(this.subElements).map((s) => s.cssStyleSheet),
    ];
  }
  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return combineLatestArrays([
      of([this.cssStyleSheet]),
      this.content$.pipe(
        map((s) => Object.values(s).map((s) => s.cssStyleSheet))
      ),
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

  // data getters
  get data(): PrimitiveElementData {
    return {
      ...super._data,
      content: this._content.data,
      elements: this._subElements.data,
    };
  }

  get data$(): Observable<PrimitiveElementData> {
    return combineLatestMerged([
      super._data$,
      combineLatest({
        content: this._content.data$,
        elements: this._subElements.data$,
      }),
    ]);
  }

  // constructor
  constructor({
    init,
    environment,
  }: {
    init: PrimitiveElementData;
    environment: RenderingEnvironment;
  }) {
    const { content, elements, ...elementData } = init;
    super({ init: elementData, environment });

    this._content = new AggregatedModelList({
      init: content || [],
      create: (data) =>
        StatefulcreateElement({
          init: data,
          environment: this.environment,
        }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this._subElements = new AggregatedModelRecord({
      init: elements || {},
      create: (data) =>
        new StatefulPrimitiveSubElement({
          init: data,
          environment: this.environment,
        }),
    });

    this.addDisposer(() => {
      this._content.dispose();
      this._subElements.dispose();
    });
  }

  // methods
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
    let element = this._subElements.state.record[name];

    if (!element && create) {
      element = new StatefulPrimitiveSubElement({
        init: {},
        environment: this.environment,
      });

      this._subElements.state.set(name, element);
    }

    return element;
  }
  subElement$(name: string): Observable<PrimitiveSubElement | undefined>;
  subElement$(name: string, create: true): Observable<PrimitiveSubElement>;
  subElement$(
    name: string,
    create?: true
  ): Observable<PrimitiveSubElement | undefined> {
    return this._subElements.state.record$.pipe(
      map((record) => record[name]),
      tap((element) => {
        if (!element && create) {
          const newElement = new StatefulPrimitiveSubElement({
            init: {},
            environment: this.environment,
          });

          this._subElements.state.set(name, newElement);
        }
      }),
      filter((element) => !create || !!element)
    );
  }

  initialize(data: Omit<PrimitiveElementData, "id" | "type">): void {
    this.restore({ ...data, id: this.id, type: this.type });
  }

  // restore method
  restore(data: PrimitiveElementData): void {
    super.restore(data);
    const { content, elements } = data;
    this._content.restore(content || []);
    this._subElements.restore(elements || {});
  }
}
