import { entityTypes, switchEntityType } from "@elllphnt/elementa-base";
import { memo } from "react";
import { FrameWidgetRenderable } from "../../renderables/instances/widgets/frame";
import { WidgetRenderable } from "../../renderables/instances/widgets/widget";
import FrameWidgetComponent from "./frame_widget";

export const WidgetComponent = memo(function ({
  widget,
}: {
  widget: WidgetRenderable;
}): JSX.Element {
  return switchEntityType(
    widget.instance.entity.type,
    {
      [entityTypes.widgets.frame]: () => {
        const frameWidget = widget as FrameWidgetRenderable;
        return <FrameWidgetComponent widget={frameWidget} />;
      },
    },
    () => <></>
  );
});

export default WidgetComponent;
