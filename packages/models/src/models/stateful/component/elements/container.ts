import { ContainerElementData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable, forkJoin } from "rxjs";
import { CssStyleSheet } from "../../../../css/_.js";
import { BaseElement } from "../../../_interfaces/component/elements/_base.js";
import { ContainerElement } from "../../../_interfaces/component/elements/container.js";
import { Fragment } from "../fragment.js";
import { BaseElementModel } from "./_base.js";
import { createElementModel } from "./_element.js";

export class ContainerElementModel
  extends BaseElementModel<ContainerElementData>
  implements ContainerElement
{
  // private properties
  private _content: AggregatedModelList<BaseElementModel<any>>;

  // getters
  get content(): BaseElement[] {
    return this._content.items;
  }

  get content$(): Observable<BaseElement[]> {
    return this._content.items$;
  }

  // data getters
  get data(): ContainerElementData {
    return {
      ...super._data,
      type: "container",
      content: this._content.data,
    };
  }

  get data$(): Observable<ContainerElementData> {
    return combineLatestMerged([
      super._data$,
      forkJoin({
        content: this._content.data$,
      }),
    ]);
  }

  // constructor
  constructor({
    init,
    fragment,
    cssStyleSheet,
  }: {
    init: ContainerElementData;
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

    this.addDisposer(() => {
      this._content.dispose();
    });
  }

  // restore method
  restore(data: ContainerElementData): void {
    this._state.setRecord({
      ...data,
      id: undefined,
      content: undefined,
    });
    this._content.restore(data.content || []);
  }
}
