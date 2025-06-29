import { SlotElementData } from "@elllphnt/elementa-base";
import { AggregatedModelList, RecordState } from "@elllphnt/elementa-utils";
import { Observable, of } from "rxjs";
import { BaseElement } from "./_base.js";
import { createElement, Element } from "./_element.js";
import { ElementEnvironment } from "./_environment.js";

export class SlotElement extends BaseElement<SlotElementData> {
  private _placeholder: AggregatedModelList<RecordState<any>, Element>;

  get placeholder(): Element[] {
    return this._placeholder.models;
  }

  get placeholder$(): Observable<Element[]> {
    return this._placeholder.models$;
  }

  get slotIds(): string[] {
    return [this.id];
  }

  get slotIds$(): Observable<string[]> {
    return of([this.id]);
  }

  constructor({
    state,
    environment,
    initialized,
  }: {
    state: RecordState<SlotElementData>;
    environment: ElementEnvironment;
    initialized?: boolean;
  }) {
    super({ state, type: "slot", environment, initialized });

    this._placeholder = new AggregatedModelList({
      state: state.getAggregatedStateList("placeholder"),
      create: (state) =>
        createElement({
          state,
          environment: this.environment,
        }),
    });

    this.addDisposer(() => {
      this._placeholder.dispose();
    });
  }
}
