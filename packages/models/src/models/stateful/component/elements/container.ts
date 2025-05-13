import { ContainerElementData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  combineLatestArrays,
  combineLatestMerged,
  combineLatestOrEmpty,
} from "@elllphnt/elementa-utils";
import { forkJoin, map, Observable, of, switchMap } from "rxjs";
import { CssStyleSheet } from "~/css/_.js";
import { Project } from "../../../../infrastructure/_.js";
import { Element } from "../../../_interfaces/_.js";
import { ContainerElement } from "../../../_interfaces/component/elements/container.js";
import { BaseElementModel } from "./_base.js";
import { createElementModel, ElementModel } from "./_element.js";

export class ContainerElementModel
  extends BaseElementModel<ContainerElementData, "content">
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

  get allCssStylesheets(): CssStyleSheet[] {
    return [
      this.cssStyleSheet,
      ...this.content.flatMap((c) => c.allCssStylesheets),
    ];
  }
  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return combineLatestArrays([
      of([this.cssStyleSheet]),
      this.content$.pipe(
        switchMap((c) =>
          combineLatestOrEmpty(c.map((c) => c.allCssStylesheets$))
        ),
        map((c) => c.flat())
      ),
    ]);
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
    const { content, ...elementData } = init;
    super({ init: elementData, project });

    this._content = new AggregatedModelList({
      init: content || [],
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
    const { content } = data;
    this._content.restore(content || []);
  }
}
