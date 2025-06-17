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
  AggregatedModelRecord,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable, combineLatest, filter, map, of, tap } from "rxjs";
import { StatefulSlotFill } from "../_shared/slot_fill.js";
import { StatefulBaseElement } from "./_base.js";

export class StatefulComponentElement
  extends StatefulBaseElement<ComponentElementData, "fills">
  implements ComponentElement
{
  // private properties
  private _fills: AggregatedModelRecord<StatefulSlotFill>;

  // getters
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
    return combineLatest({
      cssStyleSheet: of(this.cssStyleSheet),
      fills: this._fills.state.record$.pipe(
        map((fills) =>
          Object.values(fills).flatMap((fill) => fill.allCssStylesheets)
        )
      ),
    }).pipe(
      map(({ cssStyleSheet, fills }) => [cssStyleSheet, ...fills].flat())
    );
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
      combineLatest({
        fills: this._fills.data$,
      }),
    ]);
  }

  // constructor
  constructor({
    init,
    environment,
  }: {
    init: ComponentElementData;
    environment: RenderingEnvironment;
  }) {
    super({ init, environment });

    const { fills } = init;

    this._fills = new AggregatedModelRecord({
      init: fills || {},
      create: (data, key) =>
        new StatefulSlotFill({
          init: data,
          environment,
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
      const newFill = new StatefulSlotFill({
        init: {},
        environment: this.environment,
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
          const newFill = new StatefulSlotFill({
            init: {},
            environment: this.environment,
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
