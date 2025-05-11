import { useObservable } from "@elllphnt/elementa-react-utils";
import { ComponentComponent } from "@elllphnt/elementa-scene";
import { ComponentViewer } from "../../sub_viewers/component";

export function ComponentViewerComponent({
  viewer,
}: {
  viewer: ComponentViewer;
}) {
  const renderable = useObservable(viewer.renderable$, viewer.renderable);
  if (!renderable) return <></>;
  return <ComponentComponent component={renderable} />;
}
