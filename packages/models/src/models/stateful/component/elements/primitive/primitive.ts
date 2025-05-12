import {
  PrimitiveElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  AggregatedModelRecord,
  combineLatestArrays,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { filter, forkJoin, map, Observable, of, tap } from "rxjs";
import { CssStyleSheet } from "../../../../../css/_.js";
import { File, Project } from "../../../../../infrastructure/_.js";
import { Element } from "../../../../_interfaces/_.js";
import { PrimitiveElement } from "../../../../_interfaces/component/elements/primitive/primitive.js";
import { PrimitiveSubElement } from "../../../../_interfaces/component/elements/primitive/sub_element.js";
import { BaseElementModel } from "../_base.js";
import { createElementModel, ElementModel } from "../_element.js";
import { PrimitiveSubElementModel } from "./sub_element.js";

export class PrimitiveElementModel
  extends BaseElementModel<PrimitiveElementData, "content" | "elements">
  implements PrimitiveElement
{
  // private properties
  private _content: AggregatedModelList<ElementModel>;
  private _subElements: AggregatedModelRecord<PrimitiveSubElementModel>;

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

  get primitiveFile(): File | undefined {
    return this.primitiveUrl
      ? this.project.infrastructure.file(
          this.project.absoluteFileUrl(this.primitiveUrl)
        )
      : undefined;
  }
  get primitiveFile$(): Observable<File | undefined> {
    return this.primitiveUrl$.pipe(
      map((url) =>
        url
          ? this.project.infrastructure.file(this.project.absoluteFileUrl(url))
          : undefined
      )
    );
  }

  get props(): Record<string, any> | undefined {
    return this._state.entry("props");
  }

  get props$(): Observable<Record<string, any> | undefined> {
    return this._state.entry$("props");
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
      forkJoin({
        content: this._content.data$,
        elements: this._subElements.data$,
      }),
    ]);
  }

  // constructor
  constructor({
    init,
    project,
  }: {
    init: PrimitiveElementData;
    project: Project;
  }) {
    const { content, elements, ...elementData } = init;
    super({ init: elementData, project });

    this._content = new AggregatedModelList({
      init: content || [],
      create: (data) =>
        createElementModel({
          init: data,
          project: this.project,
        }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this._subElements = new AggregatedModelRecord({
      init: elements || {},
      create: (data) =>
        new PrimitiveSubElementModel({
          init: data,
          project: this.project,
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
      element = new PrimitiveSubElementModel({
        init: {},
        project: this.project,
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
          const newElement = new PrimitiveSubElementModel({
            init: {},
            project: this.project,
          });

          this._subElements.state.set(name, newElement);
        }
      }),
      filter((element) => !create || !!element)
    );
  }

  // restore method
  restore(data: PrimitiveElementData): void {
    super.restore(data);
    const { content, elements } = data;
    this._content.restore(content || []);
    this._subElements.restore(elements || {});
  }
}
