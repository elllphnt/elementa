import { entityTypes, switchEntityType } from "@elllphnt/elll-element";
import { FrameWidget, Widget } from "@repo/elementa-models";
import { Elementa } from "../elementa";
import { FrameWidgetInstance, Instance, WidgetInstance } from "../instances/_";

export function makeWidgetInstance({
  widget,
  elementa,
  parent,
}: {
  widget: Widget;
  elementa: Elementa;
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
