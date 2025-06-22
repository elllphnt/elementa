import { OverflowValue, ViewportData } from "@elllphnt/elementa-base";
import { Viewport } from "@elllphnt/elementa-core";
import {
  CrdtModel,
  CrdtRecordState,
  keyManager,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";

export class CrdtViewport extends CrdtModel<y.Map<any>> implements Viewport {
  private _state: CrdtRecordState<ViewportData>;

  get height(): number | undefined {
    return this._state.entry("height");
  }

  get height$(): Observable<number | undefined> {
    return this._state.entry$("height");
  }

  get width(): number | undefined {
    return this._state.entry("width");
  }

  get width$(): Observable<number | undefined> {
    return this._state.entry$("width");
  }

  get overflow(): OverflowValue | undefined {
    return this._state.entry("overflow");
  }

  get overflow$(): Observable<OverflowValue | undefined> {
    return this._state.entry$("overflow");
  }

  constructor({ crdt }: { crdt: y.Map<any>; initialized?: boolean }) {
    super({ key: keyManager.next("elementa-viewport"), crdt });

    this._state = new CrdtRecordState(crdt);

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtViewport({
      crdt,
      initialized: true,
    }) as this;
  }
}
