import { PointData } from "@elllphnt/elementa-utils";
import { IHandle } from "../handle";

export interface IMovableHandle extends IHandle {
  setPosition(position: PointData): void;
}
