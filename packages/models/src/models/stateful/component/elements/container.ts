import { ContainerElementData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable, forkJoin } from "rxjs";
import { CssStyleSheet } from "../../../../css/_.js";
import { ContainerElement } from "../../../_interfaces/component/elements/container.js";
import { Element } from "../../../_interfaces/component/elements/element.js";
import { Fragment } from "../fragment.js";
import { createElementModel } from "./_create.js";
import { ElementModel } from "./element.js";

export class ContainerElementModel
  extends ElementModel<ContainerElementData>
  implements ContainerElement
{
  private _content: AggregatedModelList<ElementModel<any>>;

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

  get data(): ContainerElementData {
    return {
      ...this._state.record,
      id: this._id,
      type: "container",
      content: this._content.data,
    };
  }

  get data$(): Observable<ContainerElementData> {
    return combineLatestMerged([
      this._state.record$,
      forkJoin({
        content: this._content.data$,
      }),
    ]);
  }

  restore(data: ContainerElementData): void {
    this._state.setRecord({
      ...data,
      id: undefined,
      content: undefined,
    });
    this._content.restore(data.content || []);
  }

  get content(): Element[] {
    return this._content.items;
  }

  get content$(): Observable<Element[]> {
    return this._content.items$;
  }
}
