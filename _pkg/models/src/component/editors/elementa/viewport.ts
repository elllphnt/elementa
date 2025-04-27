import { OverflowValue, ViewportData } from "@elllphnt/elementa-base";
import { MapCRDTModel } from "@elllphnt/elementa-utils";
import { map } from "rxjs";
import * as y from "yjs";

export class Viewport extends MapCRDTModel<ViewportData> {
  get height() {
    return this.state.height;
  }
  get height$() {
    return this.state$.pipe(map((data) => data.height));
  }

  get width() {
    return this.state.width;
  }
  get width$() {
    return this.state$.pipe(map((data) => data.width));
  }

  get overflow() {
    return this.state.overflow;
  }
  get overflow$() {
    return this.state$.pipe(map((data) => data.overflow));
  }

  constructor(ymap: y.Map<any>) {
    super(ymap);
  }

  setWidth(width: number) {
    this.patch({
      width: Math.round(Math.max(0, width)),
    });
  }
  setHeight(height: number) {
    this.patch({
      height: Math.round(Math.max(0, height)),
    });
  }
  setOverflow(overflow: OverflowValue) {
    this.patch({
      overflow,
    });
  }
}
