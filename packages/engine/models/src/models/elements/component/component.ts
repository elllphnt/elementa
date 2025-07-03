import type {
  ComponentElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import {
  AggregatedModelList,
  AggregatedModelRecord,
} from "@elllphnt/elementa-kernel";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { Observable } from "rxjs";
import { combineLatest, map, of, switchMap } from "rxjs";
import type { CssStyleSheet } from "~/css/lib/stylesheet.js";
import type { FileModelAdaptor } from "~/project/file/model_adaptor.js";
import { BaseElement } from "../_base.js";
import type { Element } from "../_element.js";
import { createElement } from "../_element.js";
import type { ElementEnvironment } from "../_environment.js";
import { SlotFill } from "./slot_fill.js";

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
    return combineLatest([
      of([this.cssStyleSheet]),
      this.content$.pipe(
        switchMap((c) => {
          return combineLatestOrEmpty(c.map((c) => c.allCssStylesheets$));
        }),
        map((c) => c.flat())
      ),
      this.fills$.pipe(
        switchMap((r) =>
          combineLatestOrEmpty(
            Object.values(r).map((f) => f.allCssStylesheets$)
          )
        ),
        map((arrays) => arrays.flat())
      ),
    ]).pipe(
      map(([styleSheet, contents, fills]) => [
        ...styleSheet,
        ...contents,
        ...fills,
      ])
    );
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
      state: state.getRecordOfRecordStates("fills"),
      create: (childState) =>
        new SlotFill({
          state: childState,
          environment,
          cssStyleSheetTarget: "TODO", // TODO: Fix fill CSS stylesheet target
        }),
    });

    this._content = new AggregatedModelList({
      state: state.getListOfRecordStates("content"),
      create: (childState) =>
        createElement({
          state: childState,
          environment,
          initialized: true,
        }),
    });

    this.addInitializer(() => {
      this._fills.initialize();
      this._content.initialize();

      this.addDisposer(() => {
        this._fills.dispose();
        this._content.dispose();
      });
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
