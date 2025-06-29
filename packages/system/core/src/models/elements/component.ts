import {
  ComponentElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  AggregatedModelRecord,
  combineLatestArrays,
  RecordState,
} from "@elllphnt/elementa-utils";
import { map, Observable, of, switchMap } from "rxjs";
import { CssStyleSheet } from "~/css/_.js";
import { FileModelAdaptor } from "~/project/_.js";
import { SlotFill } from "../_shared/slot_fill.js";
import { BaseElement } from "./_base.js";
import { createElement, Element } from "./_element.js";
import { ElementEnvironment } from "./_environment.js";

export class ComponentElement extends BaseElement<ComponentElementData> {
  private _fills: AggregatedModelRecord<RecordState<any>, SlotFill>;
  private _content: AggregatedModelList<RecordState<any>, Element>;

  get componentUrl(): string | undefined {
    return this.state.entry("componentUrl");
  }
  get componentUrl$(): Observable<string | undefined> {
    return this.state.entry$("componentUrl");
  }

  get component(): FileModelAdaptor<"component"> | undefined {
    return this.componentUrl
      ? this.environment.project.infrastructure.component(
          this.environment.project.absoluteFileUrl(this.componentUrl)
        )
      : undefined;
  }
  get component$(): Observable<FileModelAdaptor<"component"> | undefined> {
    return this.componentUrl$.pipe(
      map((url) =>
        url
          ? this.environment.project.infrastructure.component(
              this.environment.project.absoluteFileUrl(url)
            )
          : undefined
      )
    );
  }

  get content(): Element[] {
    return this._content.models;
  }
  get content$(): Observable<Element[]> {
    return this._content.models$;
  }

  get fills(): Record<string, SlotFill> {
    return this._fills.models;
  }
  get fills$(): Observable<Record<string, SlotFill>> {
    return this._fills.models$;
  }

  get allCssStylesheets(): CssStyleSheet[] {
    return [
      this.cssStyleSheet,
      ...this.content.flatMap((c) => c.allCssStylesheets),
      ...Object.values(this.fills).flatMap((fill) => fill.allCssStylesheets),
    ];
  }
  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return combineLatestArrays([
      of([this.cssStyleSheet]),
      this.content$.pipe(
        switchMap((c) =>
          combineLatestArrays(c.map((c) => c.allCssStylesheets$))
        ),
        map((c) => c.flat())
      ),
      this.fills$.pipe(
        switchMap((r) =>
          combineLatestArrays(Object.values(r).map((f) => f.allCssStylesheets$))
        )
      ),
    ]);
  }
  get props(): Record<string, any> | undefined {
    return this.state.entry("props") || {};
  }
  get props$(): Observable<Record<string, any> | undefined> {
    return this.state.entry$("props");
  }

  constructor({
    state,
    environment,
    initialized,
  }: {
    state: RecordState<ComponentElementData>;
    environment: ElementEnvironment;
    initialized?: boolean;
  }) {
    super({ state, type: "component", environment, initialized });

    // TODO: Update to proper state-based initialization
    this._fills = new AggregatedModelRecord({
      state: state as any, // TODO: Fix proper child state typing
      create: (childState) =>
        new SlotFill({
          state: childState,
          environment,
          cssStyleSheetTarget: "TODO", // TODO: Fix fill CSS stylesheet target
        }),
    });

    this._content = new AggregatedModelList({
      state: state as any, // TODO: Fix proper child state typing
      create: (childState) =>
        createElement({
          state: childState,
          environment,
        }),
    });

    this.addDisposer(() => {
      this._fills.dispose();
    });
  }

  private fillCssStylesheetTargetKey(key: string) {
    return `component-element-${this.id}-fill-${key}`;
  }

  prop(key: string): any {
    return this.props?.[key];
  }

  prop$(key: string): Observable<any> {
    return this.props$.pipe(map((props) => props?.[key]));
  }

  fill(id: string): SlotFill | undefined;
  fill(id: string, create: true): SlotFill;
  fill(id: string, create?: true): SlotFill | undefined {
    // TODO: Implement with new AggregatedModelRecord pattern
    return this._fills.models[id];
  }

  fill$(id: string): Observable<SlotFill | undefined>;
  fill$(id: string, create: true): Observable<SlotFill>;
  fill$(id: string, create?: true): Observable<SlotFill | undefined> {
    // TODO: Implement with new AggregatedModelRecord pattern
    return this._fills.models$.pipe(map((record) => record[id]));
  }

  setProp(key: string, value: ResolvableOrEvaluable<any> | undefined): void {
    const props = { ...this.props };

    if (value === undefined) {
      delete props[key];
    } else {
      props[key] = value;
    }

    this.state.set("props", props);
  }

  setComponentUrl(url: string | undefined): void {
    this.state.set("componentUrl", url);
  }
}
