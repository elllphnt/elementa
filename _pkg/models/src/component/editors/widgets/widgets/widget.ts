import { EntityData } from "../entity.js";

export type WidgetData = EntityData & {
  x?: number;
  y?: number;
  name?: string;
};
