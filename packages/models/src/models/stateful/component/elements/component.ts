import {
  ComponentElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import {
  AggregatedModelRecord,
  combineLatestArrays,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable, filter, forkJoin, map, of, switchMap, tap } from "rxjs";
import { CssStyleSheet } from "../../../../css/_.js";
import { Project } from "../../../../infrastructure/_.js";
import { Component, FileModel } from "../../../_interfaces/_.js";
import { SlotFill } from "../../../_interfaces/_shared/slot_fill.js";
import { ComponentElement } from "../../../_interfaces/component/elements/component.js";
import { SlotFillModel } from "../../_shared/slot_fill.js";
import { BaseElementModel } from "./_base.js";

export class ComponentElementModel
  extends BaseElementModel<ComponentElementData, "fills">
  implements ComponentElement
{
  // private properties
  private _fills: AggregatedModelRecord<SlotFillModel>;

  // getters
  get componentUrl(): string | undefined {
    return this._state.entry("componentUrl");
  }

  get componentUrl$(): Observable<string | undefined> {
    return this._state.entry$("componentUrl");
  }

  get component(): FileModel<Component> | undefined {
    return this.componentUrl
      ? this.project.infrastructure.component(
          this.project.absoluteFileUrl(this.componentUrl)
        )
      : undefined;
  }

  get component$(): Observable<FileModel<Component> | undefined> {
    return this.componentUrl$.pipe(
      map((url) =>
        url
          ? this.project.infrastructure.component(
              this.project.absoluteFileUrl(url)
            )
          : undefined
      )
    );
  }

  get fills(): Record<string, SlotFill> {
    return this._fills.state.record;
  }

  get fills$(): Observable<Record<string, SlotFill>> {
    return this._fills.state.record$;
  }

  get allCssStylesheets(): CssStyleSheet[] {
    return [
      this.cssStyleSheet,
      ...Object.values(this._fills.state.record).flatMap(
        (fill) => fill.allCssStylesheets
      ),
    ];
  }

  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return combineLatestArrays([
      of([this.cssStyleSheet]),
      this._fills.state.record$.pipe(
        switchMap((r) =>
          combineLatestArrays(Object.values(r).map((f) => f.allCssStylesheets$))
        )
      ),
    ]);
  }

  get props(): Record<string, any> | undefined {
    return this._state.entry("props") || {};
  }

  get props$(): Observable<Record<string, any> | undefined> {
    return this._state.entry$("props");
  }

  // data getters
  get data(): ComponentElementData {
    return {
      ...super._data,
      fills: this._fills.data,
    };
  }

  get data$(): Observable<ComponentElementData> {
    return combineLatestMerged([
      super._data$,
      forkJoin({
        fills: this._fills.data$,
      }),
    ]);
  }

  // constructor
  constructor({
    init,
    project,
  }: {
    init: ComponentElementData;
    project: Project;
  }) {
    super({ init, project });

    const { fills } = init;

    this._fills = new AggregatedModelRecord({
      init: fills || {},
      create: (data, key) =>
        new SlotFillModel({
          init: data,
          project,
          cssStyleSheetTarget: this.fillCssStylesheetTargetKey(key),
        }),
    });

    this.addDisposer(() => {
      this._fills.dispose();
    });
  }

  private fillCssStylesheetTargetKey(key: string) {
    return `component-element-${this.id}-fill-${key}`;
  }

  // methods
  prop(key: string): any {
    return this.props?.[key];
  }

  prop$(key: string): Observable<any> {
    return this.props$.pipe(map((props) => props?.[key]));
  }

  fill(id: string): SlotFill | undefined;
  fill(id: string, create: true): SlotFill;
  fill(id: string, create?: true): SlotFill | undefined {
    const fill = this._fills.state.record[id];

    if (fill) {
      return fill;
    }

    if (create) {
      const newFill = new SlotFillModel({
        init: {},
        project: this.project,
        cssStyleSheetTarget: this.fillCssStylesheetTargetKey(id),
      });

      this._fills.state.set(id, newFill);
      return newFill;
    }

    return undefined;
  }

  fill$(id: string): Observable<SlotFill | undefined>;
  fill$(id: string, create: true): Observable<SlotFill>;
  fill$(id: string, create?: true): Observable<SlotFill | undefined> {
    return this._fills.state.record$.pipe(
      map((record) => record[id]),
      tap((fill) => {
        if (!fill && create) {
          const newFill = new SlotFillModel({
            init: {},
            project: this.project,
            cssStyleSheetTarget: this.fillCssStylesheetTargetKey(id),
          });

          this._fills.state.set(id, newFill);
        }
      }),
      filter((fill) => !create || !!fill)
    );
  }

  setProp(key: string, value: ResolvableOrEvaluable<any> | undefined): void {
    const props = { ...this.props };

    if (value === undefined) {
      delete props[key];
    } else {
      props[key] = value;
    }

    this._state.set("props", props);
  }
  setComponentUrl(url: string | undefined): void {
    this._state.set("componentUrl", url);
  }

  // restore method
  restore(data: ComponentElementData): void {
    super.restore(data);
    const { fills } = data;
    this._fills.restore(fills || {});
  }
}
