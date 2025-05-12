import {
  ComponentElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import {
  AggregatedModelRecord,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable, forkJoin, map } from "rxjs";
import { CssStyleSheet } from "../../../../../css/_.js";
import { ComponentElement } from "../../../../_interfaces/component/elements/component/component.js";
import { SlotFill } from "../../../../_interfaces/component/elements/component/slot_fill.js";
import { FileModel } from "../../../file/file.js";
import { ComponentModel } from "../../component.js";
import { Fragment } from "../../fragment.js";
import { ElementModel } from "../element.js";
import { SlotFillModel } from "./slot_fill.js";

export class ComponentElementModel
  extends ElementModel<ComponentElementData>
  implements ComponentElement
{
  private _fills: AggregatedModelRecord<SlotFillModel>;
  private _localComponent?: FileModel<ComponentModel>;

  constructor({
    init,
    fragment,
    cssStyleSheet,
  }: {
    init: ComponentElementData;
    fragment: Fragment;
    cssStyleSheet: CssStyleSheet;
  }) {
    super({ init, fragment, cssStyleSheet });

    this._fills = new AggregatedModelRecord({
      init: init.fills || {},
      create: (data) =>
        new SlotFillModel({
          init: data,
          component: this._fragment.component,
          cssStyleSheet: this._cssStyleSheet,
        }),
    });

    this._localComponent = init.localComponent;

    this.addDisposer(() => {
      this._fills.dispose();
    });
  }

  get componentUrl(): string | undefined {
    return this._state.record.componentUrl;
  }

  get componentUrl$(): Observable<string | undefined> {
    return this._state.entry$("componentUrl");
  }

  get localComponent(): FileModel<ComponentModel> | undefined {
    return this._localComponent;
  }

  get localComponent$(): Observable<FileModel<ComponentModel> | undefined> {
    return this._state.record$.pipe(map(() => this._localComponent));
  }

  get data(): ComponentElementData {
    return {
      ...this._state.record,
      id: this._id,
      type: "component",
      fills: this._fills.data,
      localComponent: this._localComponent,
    };
  }

  get data$(): Observable<ComponentElementData> {
    return combineLatestMerged([
      this._state.record$,
      forkJoin({
        fills: this._fills.data$,
      }),
    ]);
  }

  restore(data: ComponentElementData): void {
    this._state.setRecord({
      ...data,
      id: undefined,
      fills: undefined,
      localComponent: undefined,
    });
    this._fills.restore(data.fills || {});
    this._localComponent = data.localComponent;
  }

  get fills(): Record<string, SlotFill> {
    return this._fills.state.record;
  }

  get fills$(): Observable<Record<string, SlotFill>> {
    return this._fills.state.record$;
  }

  get allCssStylesheets(): CssStyleSheet[] {
    return [
      this._cssStyleSheet,
      ...Object.values(this._fills.state.record).flatMap(
        (fill) => fill.allCssStylesheets
      ),
    ];
  }

  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return this._fragment.allCssStylesheets$;
  }

  get props(): Record<string, any> {
    return this._state.record.props || {};
  }

  get props$(): Observable<Record<string, any>> {
    return this._state.entry$("props");
  }

  prop(key: string): any {
    return this.props[key];
  }

  prop$(key: string): Observable<any> {
    return this.props$.pipe(map((props) => props[key]));
  }

  fill(id: string, create?: true): SlotFill {
    if (this._fills.state.record[id]) {
      return this._fills.state.record[id];
    }

    if (create) {
      const fill = new SlotFillModel({
        init: {
          content: [],
          interactions: {},
        },
        component: this._fragment.component,
        cssStyleSheet: this._cssStyleSheet,
      });

      this._fills.state.set(id, fill);
      return fill;
    }

    throw new Error(`Slot fill ${id} not found`);
  }

  fill$(id: string, create?: true): Observable<SlotFill> {
    return this._fills.state.record$.pipe(
      map((record) => {
        if (record[id]) {
          return record[id];
        }

        if (create) {
          const fill = new SlotFillModel({
            init: {
              content: [],
              interactions: {},
            },
            component: this._fragment.component,
            cssStyleSheet: this._cssStyleSheet,
          });

          this._fills.state.set(id, fill);
          return fill;
        }

        throw new Error(`Slot fill ${id} not found`);
      })
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

  setFill(id: string, value: SlotFill): void {
    this._fills.state.set(id, value);
  }

  setComponentUrl(url: string | undefined): void {
    this._state.set("componentUrl", url);
  }
}
