import { useObservable } from "@repo/utils";
import { FrameContext } from "../../contexts/frame";
import { FrameWidgetRenderable } from "../../renderables/instances/widgets/frame";
import { FragmentComponent } from "../fragment/fragment";

export function FrameWidgetComponent({
  widget,
}: {
  widget: FrameWidgetRenderable;
}): JSX.Element {
  return (
    <div
      data-entity={`${widget.entity.type}:${widget.entity.id}`}
      ref={(element) => {
        widget.setHtmlElement(element);
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        contain: "layout style",
      }}
    >
      <FrameWidgetContent widget={widget} />
    </div>
  );
}

function FrameWidgetContent({
  widget,
}: {
  widget: FrameWidgetRenderable;
}): JSX.Element {
  const fragment = useObservable(widget.fragment$, widget.fragment);
  if (!fragment) return <></>;
  return (
    <FrameContext.Provider value={widget}>
      <FragmentComponent key={fragment.key} fragment={fragment} isolated />
    </FrameContext.Provider>
  );
}

export default FrameWidgetComponent;
