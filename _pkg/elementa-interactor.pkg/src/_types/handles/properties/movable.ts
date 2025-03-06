import { PointData } from "@repo/utils";
import { IHandle } from "../handle";

export interface IMovableHandle extends IHandle {
  setPosition(position: PointData): void;
}
