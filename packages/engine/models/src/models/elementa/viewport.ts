import { OverflowValue, ViewportData } from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-kernel";
import { Observable } from "rxjs";

export class Viewport extends Model<RecordState<ViewportData>> {
  get height(): number | undefined {
    return this.state.entry("height");
  }

  get height$(): Observable<number | undefined> {
    return this.state.entry$("height");
  }

  get width(): number | undefined {
    return this.state.entry("width");
  }

  get width$(): Observable<number | undefined> {
    return this.state.entry$("width");
  }

  get overflow(): OverflowValue | undefined {
    return this.state.entry("overflow");
  }

  get overflow$(): Observable<OverflowValue | undefined> {
    return this.state.entry$("overflow");
  }

  constructor({ state }: { state: RecordState<ViewportData> }) {
    super({ state });

    this.addDisposer(() => {
      this.state.dispose();
    });
  }

  setHeight(height: number | undefined): void {
    this.state.set("height", height);
  }

  setWidth(width: number | undefined): void {
    this.state.set("width", width);
  }

  setOverflow(overflow: OverflowValue | undefined): void {
    this.state.set("overflow", overflow);
  }
}
