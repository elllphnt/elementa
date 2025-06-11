import { ContainerElementData } from "@elllphnt/elementa-base";
import {
  ContainerElement,
  CssStyleSheet,
  Element,
  RenderingEnvironment,
} from "@elllphnt/elementa-core";
import {
  AggregatedModelList,
  combineLatestArrays,
  combineLatestMerged,
  combineLatestOrEmpty,
} from "@elllphnt/elementa-utils";
import { combineLatest, map, Observable, of, switchMap } from "rxjs";
import { StatefulBaseElement } from "./_base.js";
import { StatefulcreateElement, StatefulElement } from "./_element.js";

export class StatefulContainerElement
  extends StatefulBaseElement<ContainerElementData, "content">
  implements ContainerElement
{
  // private properties
  private _content: AggregatedModelList<StatefulElement>;

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
      combineLatest({
        content: this._content.data$,
      }),
    ]);
  }

  // constructor
  constructor({
    init,
    environment,
  }: {
    init: ContainerElementData;
    environment: RenderingEnvironment;
  }) {
    const { content, ...elementData } = init;
    super({ init: elementData, environment });

    this._content = new AggregatedModelList({
      init: content || [],
      create: (data) =>
        StatefulcreateElement({
          init: data,
          environment: this.environment,
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
