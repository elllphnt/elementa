import { PointData } from "@elllphnt/elementa-utils";
import { Handle } from "../handle.js";

export interface IMovableHandle extends Handle {
  setPosition(position: PointData): void;
}
