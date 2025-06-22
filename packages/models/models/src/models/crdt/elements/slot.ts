import { ensureField, getOrCreateYArray } from "@elllphnt/crdt";
import { SlotElementData } from "@elllphnt/elementa-base";
import {
  Element,
  ElementEnvironment,
  SlotElement,
} from "@elllphnt/elementa-core";
import { AggregatedCrdtModelList } from "@elllphnt/elementa-utils";
import { Observable, of } from "rxjs";
import * as y from "yjs";
import { CrdtBaseElement } from "./_base.js";
import { CrdtElement, CrdtcreateElement } from "./_element.js";

export class CrdtSlotElement
  extends CrdtBaseElement<SlotElementData>
  implements SlotElement
{
  private _placeholder: AggregatedCrdtModelList<CrdtElement>;

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
    crdt,
    environment,
    initialized,
  }: {
    crdt: y.Map<any>;
    environment: ElementEnvironment;
    initialized?: boolean;
  }) {
    super({ crdt, type: "slot", environment, initialized });

    if (!initialized) {
      ensureField(crdt, "placeholder", () => new y.Array());
    }

    this._placeholder = new AggregatedCrdtModelList({
      crdt: getOrCreateYArray<y.Map<any>>(crdt, "placeholder"),
      create: (crdt, init) =>
        CrdtcreateElement({
          crdt,
          environment: this.environment,
          initialized: init && initialized,
        }),
    });

    this.addDisposer(() => {
      this._placeholder.dispose();
    });
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtSlotElement({
      crdt,
      environment: this.environment,
      initialized: true,
    }) as this;
  }
}
