import { ContainerElementData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { forkJoin, Observable } from "rxjs";
import { Project } from "../../../../infrastructure/_.js";
import { Element } from "../../../_interfaces/_.js";
import { ContainerElement } from "../../../_interfaces/component/elements/container.js";
import { BaseElementModel } from "./_base.js";
import { createElementModel, ElementModel } from "./_element.js";

export class ContainerElementModel
  extends BaseElementModel<ContainerElementData>
  implements ContainerElement
{
  // private properties
  private _content: AggregatedModelList<ElementModel>;

  // getters
  get content(): Element[] {
    return this._content.state.items;
  }

  get content$(): Observable<Element[]> {
    return this._content.state.items$;
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
    project,
  }: {
    init: ContainerElementData;
    project: Project;
  }) {
    super({ init, project });

    this._content = new AggregatedModelList({
      init: init.content || [],
      create: (data) =>
        createElementModel({
          init: data,
          project: this.project,
        }),
      dataRef: (d) => d.id,
      modelRef: (d) => d.id,
    });

    this.addDisposer(() => {
      this._content.dispose();
    });
  }

  // restore method
  restore(data: ContainerElementData): void {
    super.restore(data);
    this._state.setRecord(data);
    this._content.restore(data.content || []);
  }
}
