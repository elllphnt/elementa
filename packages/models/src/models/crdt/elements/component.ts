import { ensureField, getOrCreateYMap } from "@elllphnt/crdt";
import {
  ComponentElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import {
  ComponentElement,
  CssStyleSheet,
  FileModelAdaptor,
  RenderingEnvironment,
  SlotFill,
} from "@elllphnt/elementa-core";
import {
  AggregatedCrdtModelRecord,
  combineLatestArrays,
} from "@elllphnt/elementa-utils";
import { Observable, filter, map, of, switchMap, tap } from "rxjs";
import * as y from "yjs";
import { CrdtSlotFill } from "../_shared/slot_fill.js";
import { CrdtBaseElement } from "./_base.js";

export class CrdtComponentElement
  extends CrdtBaseElement<ComponentElementData>
  implements ComponentElement
{
  private _fills: AggregatedCrdtModelRecord<CrdtSlotFill>;

  get componentUrl(): string | undefined {
    return this._state.entry("componentUrl");
  }

  get componentUrl$(): Observable<string | undefined> {
    return this._state.entry$("componentUrl");
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

  get fills(): Record<string, SlotFill> {
    return this._fills.models;
  }

  get fills$(): Observable<Record<string, SlotFill>> {
    return this._fills.models$;
  }

  get allCssStylesheets(): CssStyleSheet[] {
    return [
      this.cssStyleSheet,
      ...Object.values(this.fills).flatMap((fill) => fill.allCssStylesheets),
    ];
  }

  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return combineLatestArrays([
      of([this.cssStyleSheet]),
      this.fills$.pipe(
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

  constructor({
    crdt,
    environment,
    initialized,
  }: {
    crdt: y.Map<any>;
    environment: RenderingEnvironment;
    initialized?: boolean;
  }) {
    super({ crdt, type: "component", environment, initialized });

    if (!initialized) {
      ensureField(crdt, "fills", () => new y.Map());
    }

    this._fills = new AggregatedCrdtModelRecord({
      crdt: getOrCreateYMap(crdt, "fills"),
      create: (crdt, key, init) =>
        new CrdtSlotFill({
          crdt,
          environment,
          cssStyleSheetTarget: this.fillCssStylesheetTargetKey(key),
          initialized: init && initialized,
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
    const fill = this._fills.models[id];

    if (fill) {
      return fill;
    }

    if (create) {
      const map = new y.Map();
      const newFill = new CrdtSlotFill({
        crdt: map,
        environment: this.environment,
        cssStyleSheetTarget: this.fillCssStylesheetTargetKey(id),
        initialized: true,
      });

      this._fills.set(id, newFill);
      return newFill;
    }

    return undefined;
  }

  fill$(id: string): Observable<SlotFill | undefined>;
  fill$(id: string, create: true): Observable<SlotFill>;
  fill$(id: string, create?: true): Observable<SlotFill | undefined> {
    return this._fills.models$.pipe(
      map((record) => record[id]),
      tap((fill) => {
        if (!fill && create) {
          const map = new y.Map();
          const newFill = new CrdtSlotFill({
            crdt: map,
            environment: this.environment,
            cssStyleSheetTarget: this.fillCssStylesheetTargetKey(id),
            initialized: true,
          });

          this._fills.set(id, newFill);
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

  protected factory(crdt: y.Map<any>): this {
    return new CrdtComponentElement({
      crdt,
      environment: this.environment,
      initialized: true,
    }) as this;
  }
}
