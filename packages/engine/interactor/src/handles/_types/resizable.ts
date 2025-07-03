import type { DimensionData } from "@elllphnt/elementa-base";
import type { Rect } from "@elllphnt/elementa-math-utils";
import type { Observable } from "rxjs";
import type { Handle } from "../handle.js";

export interface ResizableHandle extends Handle {
  get height(): number | DimensionData<string> | string | undefined;
  get height$(): Observable<
    number | DimensionData<string> | string | undefined
  >;
  get width(): number | DimensionData<string> | string | undefined;
  get width$(): Observable<number | DimensionData<string> | string | undefined>;

  resize(rect: Rect, axis?: { x?: boolean; y?: boolean }): void;
  setHeight(
    height:
      | number
      | DimensionData<"px" | "em" | "rem" | "vh" | "vw" | "%" | "fr">
      | "fit"
      | undefined
  ): void;
  setWidth(
    width:
      | number
      | DimensionData<"px" | "em" | "rem" | "vh" | "vw" | "%" | "fr">
      | "fit"
      | undefined
  ): void;
}
