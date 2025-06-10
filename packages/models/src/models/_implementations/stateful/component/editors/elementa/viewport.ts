import { OverflowValue, ViewportData } from "@elllphnt/elementa-base";
import { keyManager, Model, RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { Viewport } from "../../../../../_.js";

export class StatefulViewport extends Model<ViewportData> implements Viewport {
  private _state: RecordState<Partial<ViewportData>>;

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

  get data(): ViewportData {
    return this._state.record;
  }

  get data$(): Observable<ViewportData> {
    return this._state.record$;
  }

  constructor({ init }: { init: ViewportData }) {
    super({ key: keyManager.next("elementa-viewport") });

    this._state = new RecordState({
      init,
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  restore(data: ViewportData) {
    this._state.setRecord(data);
  }
}
