import { OverflowValue, ViewportData } from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-kernel";
import { Observable } from "rxjs";
import { modelsLogger } from "../../loggers.js";

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

    modelsLogger.info("Creating viewport", {
      width: this.width,
      height: this.height,
      overflow: this.overflow,
    });
  }

  setHeight(height: number | undefined): void {
    const previousHeight = this.height;
    modelsLogger.debug("Setting viewport height", {
      previousHeight,
      newHeight: height,
      heightChanged: previousHeight !== height,
    });

    this.state.set("height", height);

    modelsLogger.info("Viewport height updated", {
      height,
      previousHeight,
    });
  }

  setWidth(width: number | undefined): void {
    const previousWidth = this.width;
    modelsLogger.debug("Setting viewport width", {
      previousWidth,
      newWidth: width,
      widthChanged: previousWidth !== width,
    });

    this.state.set("width", width);

    modelsLogger.info("Viewport width updated", {
      width,
      previousWidth,
    });
  }

  setOverflow(overflow: OverflowValue | undefined): void {
    const previousOverflow = this.overflow;
    modelsLogger.debug("Setting viewport overflow", {
      previousOverflow,
      newOverflow: overflow,
      overflowChanged: previousOverflow !== overflow,
    });

    this.state.set("overflow", overflow);

    modelsLogger.info("Viewport overflow updated", {
      overflow,
      previousOverflow,
    });
  }
}
