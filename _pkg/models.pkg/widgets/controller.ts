import { WidgetData } from "./widget.js";

export type ControllerWidgetData = WidgetData & {
  targetId?: string;
  targetHandleId?: string;
};
