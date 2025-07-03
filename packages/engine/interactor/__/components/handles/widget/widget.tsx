import { entityTypes, switchEntityType } from "@elllphnt/elementa-base";
import { FrameWidgetHandle, WidgetHandle } from "~/handles/_";
import { FrameHandleComponent } from "../frame.js";

export function WidgetHandleComponent({ widget }: { widget: WidgetHandle }) {
  return switchEntityType(
    widget.renderable.instance.entity.type,
    {
      [entityTypes.widgets.frame]: () => {
        const frameWidget = widget as FrameWidgetHandle;
        return <FrameHandleComponent frame={frameWidget} />;
      },
    },
    () => <></>
  );
}
