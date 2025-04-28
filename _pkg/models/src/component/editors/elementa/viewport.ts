import { OverflowValue, ViewportData } from "@elllphnt/elementa-base";
import { attachReactiveMap, Extendable } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";

export type ViewportModel = ReturnType<
  typeof attachReactiveMap<ViewportData>
> & {
  height: number;
  height$: Observable<number>;

  width: number;
  width$: Observable<number>;

  overflow: OverflowValue;
  overflow$: Observable<OverflowValue>;

  setWidth(width: number): void;
  setHeight(height: number): void;
  setOverflow(overflow: OverflowValue): void;
};

/**
 * Attach Viewport behavior to a y.Map
 */
export function withViewportBehavior(ymap: y.Map<any>): ViewportModel {
  const viewport = attachReactiveMap<ViewportData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<ViewportModel>;

  // Attach native property accessors
  const fields = ["height", "width", "overflow"] as const;

  for (const field of fields) {
    Object.defineProperty(viewport, field, {
      get() {
        return viewport.value[field];
      },
      set(value) {
        viewport.set(field, value);
      },
    });

    (viewport as any)[`${field}$`] = viewport.observable$.pipe(
      map((value) => value[field])
    );
  }

  // Attach field-specific methods
  viewport.setWidth = (width: number) => {
    viewport.set("width", Math.round(Math.max(0, width)));
  };

  viewport.setHeight = (height: number) => {
    viewport.set("height", Math.round(Math.max(0, height)));
  };

  viewport.setOverflow = (overflow: OverflowValue) => {
    viewport.set("overflow", overflow);
  };

  return viewport as ViewportModel;
}

/**
 * Create a new local Viewport model
 */
export function createViewportModel(): ViewportModel {
  const ymap = new y.Map<any>();
  return withViewportBehavior(ymap);
}
