import { DimensionData } from "@elllphnt/elementa-base";
import { Rect } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { IHandle } from "../handle";

export interface IResizableHandle extends IHandle {
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
