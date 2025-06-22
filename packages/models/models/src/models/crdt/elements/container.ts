import { ensureField, getOrCreateYArray } from "@elllphnt/crdt";
import { ContainerElementData } from "@elllphnt/elementa-base";
import {
  ContainerElement,
  CssStyleSheet,
  Element,
  ElementEnvironment,
} from "@elllphnt/elementa-core";
import {
  AggregatedCrdtModelList,
  combineLatestArrays,
  combineLatestOrEmpty,
} from "@elllphnt/elementa-utils";
import { map, Observable, of, switchMap } from "rxjs";
import * as y from "yjs";
import { CrdtBaseElement } from "./_base.js";
import { CrdtcreateElement, CrdtElement } from "./_element.js";

export class CrdtContainerElement
  extends CrdtBaseElement<ContainerElementData>
  implements ContainerElement
{
  private _content: AggregatedCrdtModelList<CrdtElement>;

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
    crdt,
    environment,
    initialized,
  }: {
    crdt: y.Map<any>;
    environment: ElementEnvironment;
    initialized?: boolean;
  }) {
    super({ crdt, type: "container", environment, initialized });

    if (!initialized) {
      ensureField(crdt, "content", () => new y.Array());
    }

    this._content = new AggregatedCrdtModelList({
      crdt: getOrCreateYArray<y.Map<any>>(crdt, "content"),
      create: (crdt, init) =>
        CrdtcreateElement({
          crdt,
          environment: this.environment,
          initialized: init && initialized,
        }),
    });

    this.addDisposer(() => {
      this._content.dispose();
    });
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtContainerElement({
      crdt,
      environment: this.environment,
      initialized: true,
    }) as this;
  }
}
