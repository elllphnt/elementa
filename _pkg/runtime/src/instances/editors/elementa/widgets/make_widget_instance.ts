import { entityTypes, switchEntityType } from "@elllphnt/elementa-base";
import { FrameWidget, Widget } from "@elllphnt/elementa-models";
import { Runtime } from "../../../../runtime/runtime";
import { FrameWidgetInstance, Instance, WidgetInstance } from "../../../_";

export function makeWidgetInstance({
  widget,
  elementa,
  parent,
}: {
  widget: Widget;
  elementa: Runtime;
  parent: Instance | null;
}): WidgetInstance {
  return switchEntityType<WidgetInstance>(widget.type, {
    [entityTypes.widgets.frame]: () => {
      return new FrameWidgetInstance({
        widget: widget as FrameWidget,
        elementa,
        parent,
      });
    },
  });
}
