import type { PointData } from "@elllphnt/elementa-utils";
import type { Handle } from "../handle.js";

export interface IMovableHandle extends Handle {
  setPosition(position: PointData): void;
}
