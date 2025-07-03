import type { ContainerElementData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { AggregatedModelList } from "@elllphnt/elementa-kernel";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { Observable } from "rxjs";
import { combineLatest, map, of, switchMap } from "rxjs";
import type { CssStyleSheet } from "~/css/lib/stylesheet.js";
import { BaseElement } from "./_base.js";
import type { Element } from "./_element.js";
import { createElement } from "./_element.js";
import type { ElementEnvironment } from "./_environment.js";

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
    return combineLatest([
      of([this.cssStyleSheet]),
      this.content$.pipe(
        switchMap((c) =>
          combineLatestOrEmpty(c.map((c) => c.allCssStylesheets$))
        ),
        map((c) => c.flat())
      ),
    ]).pipe(map(([main, content]) => [...main, ...content]));
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
      state: state.getListOfRecordStates("content"),
      create: (state) =>
        createElement({
          state,
          environment: this.environment,
          initialized: true,
        }),
    });

    this.addInitializer(() => {
      this._content.initialize();

      this.addDisposer(() => {
        this._content.dispose();
      });
    });
  }
}
