import {
  PrimitiveElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  AggregatedModelRecord,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable, forkJoin, map, of } from "rxjs";
import { CssStyleSheet } from "../../../../../css/_.js";
import { PrimitiveElement } from "../../../../_interfaces/component/elements/primitive/primitive.js";
import { PrimitiveSubElement } from "../../../../_interfaces/component/elements/primitive/sub_element.js";
import { Fragment } from "../../fragment.js";
import { createElementModel } from "../_create.js";
import { ElementModel } from "../element.js";
import { PrimitiveSubElementModel } from "./sub_element.js";

export class PrimitiveElementModel
  extends ElementModel<PrimitiveElementData>
  implements PrimitiveElement
{
  private _content: AggregatedModelList<ElementModel<any>>;
  private _subElements: AggregatedModelRecord<PrimitiveSubElementModel>;

  constructor({
    init,
    fragment,
    cssStyleSheet,
  }: {
    init: PrimitiveElementData;
    fragment: Fragment;
    cssStyleSheet: CssStyleSheet;
  }) {
    super({ init, fragment, cssStyleSheet });

    this._content = new AggregatedModelList({
      init: init.content || [],
      create: (data) =>
        createElementModel({
          init: data,
          fragment: this._fragment,
          cssStyleSheet: this._cssStyleSheet,
        }),
    });

    this._subElements = new AggregatedModelRecord({
      init: init.elements || {},
      create: (data) =>
        new PrimitiveSubElementModel({
          init: data,
          component: this._fragment.component,
          cssStyleSheet: this._cssStyleSheet,
        }),
    });

    this.addDisposer(() => {
      this._content.dispose();
      this._subElements.dispose();
    });
  }

  get data(): PrimitiveElementData {
    return {
      ...this._state.record,
      id: this._id,
      type: "primitive",
      content: this._content.data,
      elements: this._subElements.data,
    };
  }

  get data$(): Observable<PrimitiveElementData> {
    return combineLatestMerged([
      this._state.record$,
      forkJoin({
        content: this._content.data$,
        elements: this._subElements.data$,
      }),
    ]);
  }

  restore(data: PrimitiveElementData): void {
    this._state.setRecord({
      ...data,
      id: undefined,
      content: undefined,
      elements: undefined,
    });
    this._content.restore(data.content || []);
    this._subElements.restore(data.elements || {});
  }

  get content(): Element[] {
    return this._content.items;
  }

  get content$(): Observable<Element[]> {
    return this._content.items$;
  }

  get allCssStylesheets(): any[] {
    return [this._cssStyleSheet];
  }

  get allCssStylesheets$(): Observable<any[]> {
    return of([this._cssStyleSheet]);
  }

  get primitiveUrl(): string | undefined {
    return this._state.record.primitiveUrl;
  }

  get primitiveUrl$(): Observable<string | undefined> {
    return this._state.entry$("primitiveUrl");
  }

  get primitiveAbsoluteUrl(): string | undefined {
    return this._state.record.primitiveAbsoluteUrl;
  }

  get primitiveAbsoluteUrl$(): Observable<string | undefined> {
    return this._state.entry$("primitiveAbsoluteUrl");
  }

  get primitiveFile(): File | undefined {
    return this._state.record.primitiveFile;
  }

  get primitiveFile$(): Observable<File | undefined> {
    return this._state.entry$("primitiveFile");
  }

  get props(): Record<string, any> {
    return this._state.record.props || {};
  }

  get props$(): Observable<Record<string, any>> {
    return this._state.entry$("props");
  }

  prop(key: string): any {
    return this.props[key];
  }

  prop$(key: string): Observable<any> {
    return this.props$.pipe(map((props) => props[key]));
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

  element(name: string, create?: true): PrimitiveSubElement {
    if (this._subElements.state.record[name]) {
      return this._subElements.state.record[name];
    }

    if (create) {
      const element = new PrimitiveSubElementModel({
        init: {
          interactions: {},
        },
        component: this._fragment.component,
        cssStyleSheet: this._cssStyleSheet,
      });

      this._subElements.state.set(name, element);
      return element;
    }

    throw new Error(`Element ${name} not found`);
  }

  element$(name: string, create?: true): Observable<PrimitiveSubElement> {
    return this._subElements.state.record$.pipe(
      map((record) => {
        if (record[name]) {
          return record[name];
        }

        if (create) {
          const element = new PrimitiveSubElementModel({
            init: {
              interactions: {},
            },
            component: this._fragment.component,
            cssStyleSheet: this._cssStyleSheet,
          });

          this._subElements.state.set(name, element);
          return element;
        }

        throw new Error(`Element ${name} not found`);
      })
    );
  }
}
