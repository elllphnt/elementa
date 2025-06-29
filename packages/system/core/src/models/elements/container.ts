import { ContainerElementData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  combineLatestArrays,
  combineLatestOrEmpty,
  RecordState,
} from "@elllphnt/elementa-utils";
import { map, Observable, of, switchMap } from "rxjs";
import { CssStyleSheet } from "~/css/_.js";
import { BaseElement } from "./_base.js";
import { createElement, Element } from "./_element.js";
import { ElementEnvironment } from "./_environment.js";

export class ContainerElement extends BaseElement<ContainerElementData> {
  private _content: AggregatedModelList<RecordState<any>, Element>;

  get content(): Element[] {
    return this._content.models;
  }
  get content$(): Observable<Element[]> {
    return this._content.models$;
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

  constructor({
    state,
    environment,
    initialized,
  }: {
    state: RecordState<ContainerElementData>;
    environment: ElementEnvironment;
    initialized?: boolean;
  }) {
    super({ state, type: "container", environment, initialized });

    this._content = new AggregatedModelList<RecordState<any>, Element>({
      state: state.getAggregatedStateList("content"),
      create: (state) =>
        createElement({
          state,
          environment: this.environment,
        }),
    });

    this.addDisposer(() => {
      this._content.dispose();
    });
  }
}
