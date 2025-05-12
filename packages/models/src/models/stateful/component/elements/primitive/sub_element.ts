import { Expression, PrimitiveSubElementData } from "@elllphnt/elementa-base";
import {
  Model,
  RecordState,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable, map } from "rxjs";
import { CssStyleSheet } from "../../../../../css/_.js";
import { Component } from "../../../../_interfaces/component/component.js";
import { PrimitiveSubElement } from "../../../../_interfaces/component/elements/primitive/sub_element.js";

export class PrimitiveSubElementModel
  extends Model<PrimitiveSubElementData>
  implements PrimitiveSubElement
{
  private _state: RecordState<Partial<PrimitiveSubElementData>>;
  private _component: Component;
  private _cssStyleSheet: CssStyleSheet;

  constructor({
    init,
    component,
    cssStyleSheet,
  }: {
    init: PrimitiveSubElementData;
    component: Component;
    cssStyleSheet: CssStyleSheet;
  }) {
    super();

    this._component = component;
    this._cssStyleSheet = cssStyleSheet;

    this._state = new RecordState({
      init: {
        ...init,
        component: undefined,
        cssStyleSheet: undefined,
      },
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  get component(): Component {
    return this._component;
  }

  get cssStyleSheet(): CssStyleSheet {
    return this._cssStyleSheet;
  }

  get data(): PrimitiveSubElementData {
    return {
      ...this._state.record,
    };
  }

  get data$(): Observable<PrimitiveSubElementData> {
    return combineLatestMerged([this._state.record$]);
  }

  restore(data: PrimitiveSubElementData): void {
    this._state.setRecord({
      ...data,
    });
  }

  get interactions(): Record<string, Expression> {
    return this._state.record.interactions || {};
  }

  get interactions$(): Observable<Record<string, Expression>> {
    return this._state.entry$("interactions");
  }

  interaction(event: string): Expression | undefined {
    return this.interactions[event];
  }

  interaction$(event: string): Observable<Expression | undefined> {
    return this.interactions$.pipe(map((interactions) => interactions[event]));
  }

  setInteraction(event: string, interaction: Expression): void {
    const interactions = { ...this.interactions };
    interactions[event] = interaction;
    this._state.set("interactions", interactions);
  }

  clearInteractions(): void {
    this._state.set("interactions", {});
  }
}
