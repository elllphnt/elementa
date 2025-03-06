import { entityTypes, switchEntityType } from "@elllphnt/elll-element";
import { FrameWidgetHandle, WidgetHandle } from "~/src/handles/_";
import { ControllerWidgetHandleComponent } from "./controller/controller";
import { FrameWidgetHandleComponent } from "./frame_widget";

export function WidgetHandleComponent({ widget }: { widget: WidgetHandle }) {
  return switchEntityType(
    widget.renderable.instance.entity.type,
    {
      [entityTypes.widgets.frame]: () => {
        const frameWidget = widget as FrameWidgetHandle;
        return <FrameWidgetHandleComponent widget={frameWidget} />;
      },
      [entityTypes.widgets.controller]: () => {
        const controllerWidget = widget as ControllerWidgetHandle;
        return <ControllerWidgetHandleComponent widget={controllerWidget} />;
      },
    },
    () => <></>,
  );
}
