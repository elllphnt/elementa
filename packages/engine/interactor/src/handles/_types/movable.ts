import type { PointData } from "@elllphnt/elementa-math-utils";
import type { Handle } from "../handle.js";

export interface MovableHandle extends Handle {
  setPosition(position: PointData): void;
}
